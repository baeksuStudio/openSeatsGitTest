from flask import Blueprint, render_template, url_for, request, current_app, g, abort, flash
from datetime import datetime
from werkzeug.utils import secure_filename, redirect
from openseats import db
# from __main__ import app
from openseats.models import Group, Image, Reservation, User
from openseats.forms import GroupForm
from .auth_views import login_required

import os
bp = Blueprint('group', __name__, url_prefix='/group')


@bp.route('/')
def main_page():
    page = request.args.get('page', type=int, default=1)  # 페이지
    group_list = Group.query.order_by(Group.created_at.desc())
    group_list = group_list.paginate(page=page, per_page=12)
    return render_template(
        'group/group.html', 
        group_list=group_list,
        )

@bp.route('/detail/<int:group_id>')
@login_required
def detail_page(group_id): 
    # 이미 가입되어 있는지 확인
    is_joined = False

    if g.user == None:
        # 회원정보가 없을 경우
        return abort(404, 'please login')
    else:
        # 회원정보 있을 경우
        user = User.query.get(g.user.id)
        group = Group.query.get(group_id)

        # 유저와 호텔 두개의 정보가 모두 있는 Reservation record가 있는지 확인
        joined_reservations = Reservation.query.filter_by(user_id=user.id, group_id=group.id).first()

        if not user or not group:
            abort(404, '유져와 그룹 정보가 없습니다.')
        if joined_reservations:
            is_joined = True
        else:
            is_joined = False
            
    group = Group.query.get_or_404(group_id)
    return render_template('group/group_detail.html', group=group, is_joined=is_joined)
    

@bp.route('/join/<int:group_id>', methods=['POST'])
def join(group_id):
    # group = Group.query.get_or_404(group_id)
        # user = g.user
    if g.user == None:
        # 회원정보가 없을 경우
        return redirect(url_for(auth.SignIn)) 
    else:
        # 회원정보 있을 경우
        user = User.query.get(g.user.id)
        group = Group.query.get(group_id)
        if not user or not group:
            abort(404, '유져와 그룹 정보가 없습니다.')
        if user.reservation and group.reservation:
            return redirect(url_for('group.detail_page', group_id=group_id))   
        else:
            reservation = Reservation(user_id=user.id, group_id=group_id)
            db.session.add(reservation)
            db.session.commit()
            return redirect(url_for('group.detail_page', group_id=group_id))
    return redirect(url_for('main.main_page'))

   
    

@bp.route('/create/', methods=('GET', 'POST'))
@login_required
def create():
    form = GroupForm()
    if request.method == 'POST' and form.validate_on_submit():
        # 새로운 Group 모델 객체 생성
        group = Group(
            name=form.name.data, 
            address=form.address.data, 
            description=form.description.data, 
            money_per_hour=int(form.money_per_hour.data), 
            owner=g.user
            )
        db.session.add(group)
        db.session.commit()

        # 이미지 파일 업로드
        # for image_file in request.files.getlist('images'):
        for n, image_file in enumerate(request.files.getlist('images')):
            file_extension = os.path.splitext(image_file.filename)[1]
            filename = secure_filename(str(n) + file_extension)
            path = os.path.join(current_app.config['UPLOAD_FOLDER'], str(group.id), filename)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            image_file.save(path)

            
            image = Image(name=filename, path=path, group_id=group.id)
            db.session.add(image)

        db.session.commit()

        return redirect(url_for('group.main_page'))
    return render_template('group/group_create.html', form=form)

# 여러개의 group을 만들때 사용하는 테스트 함수
# @bp.route('/create/', methods=('GET', 'POST'))
# @login_required
# def create():
#     form = GroupForm()
#     if request.method == 'POST' and form.validate_on_submit():
#         # 새로운 Group 모델 객체 생성
#         for i in range(300):
#             group = Group(
#                 name=f"test {str(i)}", 
#                 address=form.address.data, 
#                 description=form.description.data, 
#                 money_per_hour=int(form.money_per_hour.data), 
#                 owner=g.user
#                 )
#             db.session.add(group)
#             db.session.commit()

#             # 이미지 파일 업로드
#             # for image_file in request.files.getlist('images'):
#             for n, image_file in enumerate(request.files.getlist('images')):
#                 file_extension = os.path.splitext(image_file.filename)[1]
#                 filename = secure_filename(str(n) + file_extension)
#                 path = os.path.join(current_app.config['UPLOAD_FOLDER'], str(group.id), filename)
#                 os.makedirs(os.path.dirname(path), exist_ok=True)
#                 image_file.save(path)

                
#                 image = Image(name=filename, path=path, group_id=group.id)
#                 db.session.add(image)

#         db.session.commit()

#         return redirect(url_for('group.main_page'))
#     return render_template('group/group_create.html', form=form)