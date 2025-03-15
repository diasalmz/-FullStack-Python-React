from app import db
from datetime import datetime

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    markup_percentage = db.Column(db.Float, nullable=False, default=0.0)  # Наценка в договоре клиента
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoices = db.relationship('Invoice', back_populates='client', lazy='dynamic')
    debts = db.relationship('Debt', back_populates='client', lazy='dynamic')
    
    def __repr__(self):
        return f"<Client {self.name}>" 