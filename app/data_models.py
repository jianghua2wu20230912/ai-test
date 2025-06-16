from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB # For fields that might store flexible JSON data
import datetime

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationships
    requirements = db.relationship('Requirement', backref='project', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Project {self.name}>'

class Requirement(db.Model):
    __tablename__ = 'requirements'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationships
    versions = db.relationship('Version', backref='requirement', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Requirement {self.name}>'

class Version(db.Model):
    __tablename__ = 'versions'
    id = db.Column(db.Integer, primary_key=True)
    version_number = db.Column(db.String(50), nullable=False) # e.g., "v1.0", "v2.0.1"
    description = db.Column(db.Text, nullable=True)
    requirement_id = db.Column(db.Integer, db.ForeignKey('requirements.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationships
    test_points = db.relationship('TestPoint', backref='version', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Version {self.version_number} for Req ID {self.requirement_id}>'

class TestPoint(db.Model):
    __tablename__ = 'test_points'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False) # "测试关注点，通常为一句需求拆解语句"
    description = db.Column(db.Text, nullable=True)
    version_id = db.Column(db.Integer, db.ForeignKey('versions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationships
    test_cases = db.relationship('TestCase', backref='test_point', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<TestPoint {self.name}>'

class TestCase(db.Model):
    __tablename__ = 'test_cases'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True) # "描述测试步骤、输入、期望结果、数据等"
    test_point_id = db.Column(db.Integer, db.ForeignKey('test_points.id'), nullable=False)
    case_type = db.Column(db.String(50), nullable=True) # 正向/逆向/异常/边界
    priority = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default='New') # 新建/待评审/已通过/废弃等
    steps = db.Column(JSONB, nullable=True) # Store test steps as JSON
    expected_result = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Could add fields for historical data, AI recommendations, etc. as per full spec

    def __repr__(self):
        return f'<TestCase {self.name}>'

# Placeholder for other models that might be needed from the spec
# e.g., User, Role, Permission, Tag, Comment, AuditLog, etc.
# For now, focusing on the core structure given in the diagram.
