from app import db
from datetime import datetime

class Debt(db.Model):
    __tablename__ = 'debts'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    debt_type = db.Column(db.String(20), nullable=False)  # 'client' or 'supplier'
    is_paid = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.Date)
    
    # Foreign keys
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoice = db.relationship('Invoice', back_populates='debts')
    client = db.relationship('Client', back_populates='debts')
    supplier = db.relationship('Supplier', back_populates='debts')
    
    def __repr__(self):
        entity = f"Client {self.client_id}" if self.debt_type == 'client' else f"Supplier {self.supplier_id}"
        return f"<Debt {self.id} - {entity} - {self.amount}>" 