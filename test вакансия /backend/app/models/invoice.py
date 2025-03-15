from app import db
from datetime import datetime

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), nullable=False, unique=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    total_amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    
    # Foreign keys
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = db.relationship('Client', back_populates='invoices')
    supplier = db.relationship('Supplier', back_populates='invoices')
    transactions = db.relationship('Transaction', back_populates='invoice', lazy='dynamic')
    debts = db.relationship('Debt', back_populates='invoice', lazy='dynamic')
    items = db.relationship('InvoiceItem', back_populates='invoice', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"
        
    def calculate_markup_amount(self):
        """Calculate the markup amount based on client's markup percentage"""
        return self.total_amount * (self.client.markup_percentage / 100)
        
    def calculate_total_with_markup(self):
        """Calculate the total amount with markup"""
        return self.total_amount + self.calculate_markup_amount()


class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    material_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # e.g., kg, pcs, m
    
    # Relationships
    invoice = db.relationship('Invoice', back_populates='items')
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price
        
    def __repr__(self):
        return f"<InvoiceItem {self.material_name}>" 