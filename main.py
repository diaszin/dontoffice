from controllers.FileController import FileController
from controllers.UrlsController import UrlsController
from flask import Flask, render_template, redirect, url_for, request, send_from_directory
import os


app = Flask(__name__, template_folder='views', static_folder='static')


@app.route('/')
def home():
    return render_template('home.html')


@app.route("/<string:secret_page_name>")
def secret_page(secret_page_name):
    urls = UrlsController(secret_page_name)
    content = urls.read_one()

    if content:
        filename = content[2]
        file_path = os.path.join(app.root_path, "bucket", filename)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                file_content = f.read()
        except UnicodeDecodeError:
            file_content = None  # arquivo binário, só exibe download
        except FileNotFoundError:
            file_content = None


        file_extension =  filename.split(".")[-1]
        page = {
            "name": content[1],
            "filename": filename,
            "content": file_content,
            "extension": file_extension,
        }

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


@app.route("/download/<path:filename>")
def download(filename):
    bucket_dir = os.path.join(app.root_path, "bucket")
    return send_from_directory(bucket_dir, filename, as_attachment=True)


@app.route("/update/<string:secret_page_name>", methods=["POST"])
def update_file(secret_page_name):
    from flask import jsonify

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    urls = UrlsController(secret_page_name)
    content = urls.read_one()
    if not content:
        return jsonify({"error": "Página não encontrada"}), 404

    url_id = content[0]
    file_controller = FileController(file)
    file_controller.save(url_id)

    new_filename = file_controller.file_model.filename
    file_path = os.path.join(app.root_path, "bucket", new_filename)

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            file_content = f.read()
    except (UnicodeDecodeError, FileNotFoundError):
        file_content = None

    return jsonify({
        "filename": new_filename,
        "content": file_content,
        "extension": new_filename.split(".")[-1],
    })



if __name__ == "__main__":
    app.run(debug=True)
