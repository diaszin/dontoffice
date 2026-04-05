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

    if content:
        return render_template('secret_page.html', secret_page_name=secret_page_name, content=content)
    else:
        return render_template("not-found-secret-page.html", secret_page_name=secret_page_name), 404 # Retorna página de erro com o status code 404


@app.route("/create", methods=["POST"])
def create():
    secret_page_name = request.form['secret_page_name']
    urls = UrlsController(secret_page_name)
    urls.create()

    return redirect(url_for('secret_page', secret_page_name=secret_page_name))

if __name__ == "__main__":
    app.run(debug=True)