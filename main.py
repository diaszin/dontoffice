from controllers.FileController import FileController
from controllers.UrlsController import UrlsController
from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__, template_folder='views', static_folder='static')


@app.route('/')
def home():
    return render_template('home.html')


@app.route("/<string:secret_page_name>")
def secret_page(secret_page_name):
    urls = UrlsController(secret_page_name)
    content = urls.read_one()


    page = {
        "name": content[1],
        "filename": content[2]
    }

    print(page)

    if content:
        return render_template('secret_page.html', page=page)
    else:
        return render_template("not-found-secret-page.html", secret_page_name=secret_page_name), 404 # Retorna página de erro com o status code 404


@app.route("/create", methods=["POST"])
def create():
    secret_page_name = request.form['secret_page_name']
    file = request.files['file']

    file_controller = FileController(file)
    urls = UrlsController(secret_page_name)
    id = urls.create()



    file_controller.save(id)

    return redirect(url_for('secret_page', secret_page_name=secret_page_name))

if __name__ == "__main__":
    app.run(debug=True)