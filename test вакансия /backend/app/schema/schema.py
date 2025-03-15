import graphene
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from app.models import Client, Supplier, Invoice, InvoiceItem, Transaction, Debt
from app import db
from datetime import datetime

# Node interface
class Node(relay.Node):
    class Meta:
        name = 'Node'

    @staticmethod
    def to_global_id(type, id):
        return f"{type}:{id}"

    @staticmethod
    def get_node_from_global_id(info, global_id, only_type=None):
        type, id = global_id.split(':')
        if only_type:
            assert type == only_type._meta.name, f'Expected {only_type._meta.name}, got {type}'
        return type, id

# Types
class ClientType(SQLAlchemyObjectType):
    class Meta:
        model = Client
        interfaces = (Node,)

class SupplierType(SQLAlchemyObjectType):
    class Meta:
        model = Supplier
        interfaces = (Node,)

class InvoiceItemType(SQLAlchemyObjectType):
    class Meta:
        model = InvoiceItem
        interfaces = (Node,)

class InvoiceType(SQLAlchemyObjectType):
    class Meta:
        model = Invoice
        interfaces = (Node,)
    
    total_with_markup = graphene.Float()
    markup_amount = graphene.Float()
    
    def resolve_total_with_markup(self, info):
        return self.calculate_total_with_markup()
    
    def resolve_markup_amount(self, info):
        return self.calculate_markup_amount()

class TransactionType(SQLAlchemyObjectType):
    class Meta:
        model = Transaction
        interfaces = (Node,)

class DebtType(SQLAlchemyObjectType):
    class Meta:
        model = Debt
        interfaces = (Node,)

# Input types
class ClientInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    markup_percentage = graphene.Float(required=True)

class SupplierInput(graphene.InputObjectType):
    name = graphene.String(required=True)

class InvoiceItemInput(graphene.InputObjectType):
    material_name = graphene.String(required=True)
    quantity = graphene.Float(required=True)
    unit_price = graphene.Float(required=True)
    unit = graphene.String(required=True)

class InvoiceInput(graphene.InputObjectType):
    invoice_number = graphene.String(required=True)
    date = graphene.Date(required=True)
    description = graphene.String()
    client_id = graphene.Int(required=True)
    supplier_id = graphene.Int(required=True)
    items = graphene.List(InvoiceItemInput, required=True)

# Mutations
class CreateClient(graphene.Mutation):
    class Arguments:
        input = ClientInput(required=True)
    
    client = graphene.Field(ClientType)
    
    @staticmethod
    def mutate(root, info, input):
        client = Client(
            name=input.name,
            markup_percentage=input.markup_percentage
        )
        db.session.add(client)
        db.session.commit()
        return CreateClient(client=client)

class CreateSupplier(graphene.Mutation):
    class Arguments:
        input = SupplierInput(required=True)
    
    supplier = graphene.Field(SupplierType)
    
    @staticmethod
    def mutate(root, info, input):
        supplier = Supplier(
            name=input.name
        )
        db.session.add(supplier)
        db.session.commit()
        return CreateSupplier(supplier=supplier)

class CreateInvoice(graphene.Mutation):
    class Arguments:
        input = InvoiceInput(required=True)
    
    invoice = graphene.Field(InvoiceType)
    transaction = graphene.Field(TransactionType)
    client_debt = graphene.Field(DebtType)
    supplier_debt = graphene.Field(DebtType)
    
    @staticmethod
    def mutate(root, info, input):
        # Get client and supplier
        client = Client.query.get(input.client_id)
        supplier = Supplier.query.get(input.supplier_id)
        
        if not client or not supplier:
            raise Exception("Client or supplier not found")
        
        # Calculate total amount
        total_amount = 0
        items = []
        
        for item_data in input.items:
            item = InvoiceItem(
                material_name=item_data.material_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                unit=item_data.unit
            )
            total_amount += item.quantity * item.unit_price
            items.append(item)
        
        # Create invoice
        invoice = Invoice(
            invoice_number=input.invoice_number,
            date=input.date,
            description=input.description,
            client_id=input.client_id,
            supplier_id=input.supplier_id,
            total_amount=total_amount
        )
        
        # Add items to invoice
        invoice.items = items
        
        # Save invoice
        db.session.add(invoice)
        db.session.flush()  # Get invoice ID without committing
        
        # Create transaction with markup
        markup_amount = invoice.calculate_markup_amount()
        total_with_markup = invoice.calculate_total_with_markup()
        
        transaction = Transaction(
            transaction_type='invoice',
            amount=total_with_markup,
            description=f"Transaction for invoice {invoice.invoice_number} with markup {client.markup_percentage}%",
            date=invoice.date,
            invoice_id=invoice.id
        )
        
        # Create debts
        client_debt = Debt(
            amount=total_with_markup,
            debt_type='client',
            invoice_id=invoice.id,
            client_id=client.id,
            due_date=invoice.date  # You might want to add some days here
        )
        
        supplier_debt = Debt(
            amount=total_amount,
            debt_type='supplier',
            invoice_id=invoice.id,
            supplier_id=supplier.id,
            due_date=invoice.date  # You might want to add some days here
        )
        
        # Save everything
        db.session.add(transaction)
        db.session.add(client_debt)
        db.session.add(supplier_debt)
        db.session.commit()
        
        return CreateInvoice(
            invoice=invoice,
            transaction=transaction,
            client_debt=client_debt,
            supplier_debt=supplier_debt
        )

# Query
class Query(graphene.ObjectType):
    node = Node.Field()
    
    # Clients
    all_clients = SQLAlchemyConnectionField(ClientType)
    client = graphene.Field(ClientType, id=graphene.Int())
    
    # Suppliers
    all_suppliers = SQLAlchemyConnectionField(SupplierType)
    supplier = graphene.Field(SupplierType, id=graphene.Int())
    
    # Invoices
    all_invoices = SQLAlchemyConnectionField(InvoiceType)
    invoice = graphene.Field(InvoiceType, id=graphene.Int())
    
    # Transactions
    all_transactions = SQLAlchemyConnectionField(TransactionType)
    transaction = graphene.Field(TransactionType, id=graphene.Int())
    
    # Debts
    all_debts = SQLAlchemyConnectionField(DebtType)
    client_debts = graphene.List(DebtType, client_id=graphene.Int())
    supplier_debts = graphene.List(DebtType, supplier_id=graphene.Int())
    
    def resolve_client(self, info, id):
        return Client.query.get(id)
    
    def resolve_supplier(self, info, id):
        return Supplier.query.get(id)
    
    def resolve_invoice(self, info, id):
        return Invoice.query.get(id)
    
    def resolve_transaction(self, info, id):
        return Transaction.query.get(id)
    
    def resolve_client_debts(self, info, client_id):
        return Debt.query.filter_by(client_id=client_id).all()
    
    def resolve_supplier_debts(self, info, supplier_id):
        return Debt.query.filter_by(supplier_id=supplier_id).all()

# Mutation
class Mutation(graphene.ObjectType):
    create_client = CreateClient.Field()
    create_supplier = CreateSupplier.Field()
    create_invoice = CreateInvoice.Field()

# Schema
schema = graphene.Schema(query=Query, mutation=Mutation) 