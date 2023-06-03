from flask import Blueprint, render_template, abort, request, flash, url_for
from werkzeug.utils import redirect
from werkzeug.security import generate_password_hash, check_password_hash

from openseats import db

from openseats.models import User
from .auth_views import login_required
from openseats.forms import UserEditForm

bp = Blueprint('main', __name__, url_prefix='/')

@bp.route('/')
def main_page() :
    return render_template('main.html')

@bp.route('/canvasTest')
def test_page() :
    return render_template('canvas/test.html')


@bp.route('/<string:user_page>')
def my_page(user_page) :
    user = User.query.filter_by(userID=user_page).first()
    if user is None :
        abort(404)
    else :
        return render_template('mypage/mypage.html', user=user)

@bp.route('/<string:user_page>/edit', methods=('GET', 'POST'))
@login_required
def my_page_edit(user_page) :
    form = UserEditForm()
    user = User.query.filter_by(userID=user_page).first()
    if request.method == 'POST' and form.validate_on_submit():
        now_password_error = None
        if not check_password_hash(user.password, form.Nowpassword.data):
            now_password_error = '현재 비밀번호가 올바르지 않습니다.'

        if now_password_error is None :
            flash_message = []
            Edituser_username = User.query.filter_by(username=form.Editusername.data).first()
            Edituser_email = User.query.filter_by(email=form.Editemail.data).first()
            Edituser_userID = User.query.filter_by(userID=form.EdituserID.data).first()


            if not Edituser_username or user.username == Edituser_username.username:
                if not Edituser_email or user.email == Edituser_email.email:
                    if not Edituser_userID or user.userID == Edituser_userID.userID:
                        
                        if not check_password_hash(user.password, form.Editpassword1.data) and form.Editpassword1.data != '': # 변경할 비밀번호를 입력했는지 확인
                            user.password = generate_password_hash(form.Editpassword1.data)  
                            user.username = form.Editusername.data
                            user.email = form.Editemail.data
                            user.userID = form.EdituserID.data
                            user.userMessage = form.EdituserMessage.data
                            db.session.commit()

                            return redirect(url_for('auth.logout'))
                        else :
                            user.username = form.Editusername.data
                            user.email = form.Editemail.data
                            user.userID = form.EdituserID.data
                            user.userMessage = form.EdituserMessage.data
                            db.session.commit()
                        
                            return redirect(url_for('main.my_page', user_page=user.userID))
                    else :
                        flash_message.append('이미 존재하는 사용자 아이디 입니다.')
                else :
                    flash_message.append('이미 존재하는 사용자 이메일 입니다.')
            else:
                flash_message.append('이미 존재하는 사용자 이름 입니다.')

            if flash_message :
                flash_list(flash_message)

        else :
            flash(now_password_error)

    return render_template('mypage/mypage_edit.html', user=user, form=form)

