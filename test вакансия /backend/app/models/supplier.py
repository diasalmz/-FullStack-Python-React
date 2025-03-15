from app import db
from datetime import datetime

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoices = db.relationship('Invoice', back_populates='supplier', lazy='dynamic')
    debts = db.relationship('Debt', back_populates='supplier', lazy='dynamic')
    
    def __repr__(self):
        return f"<Supplier {self.name}>" 