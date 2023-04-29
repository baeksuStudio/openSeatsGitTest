from openseats import db

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    money_per_hour = db.Column(db.Integer, nullable=False)
    create_date = db.Column(db.DateTime(), nullable=False)

# https://sqlalchemy-imageattach.readthedocs.io/en/1.0.0/guide/context.html#thumbnails

# class Answer(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'))
#     question = db.relationship('Question', backref=db.backref('answer_set', cascade='all, delete-orphan'))
#     content = db.Column(db.Text(), nullable=False)
#     create_date = db.Column(db.DateTime(), nullable=False)