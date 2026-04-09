from models.FileModel import FileModel
from werkzeug.datastructures import FileStorage
from uuid import uuid4


class FileController:
    def __init__(self, file: FileStorage):
        self.file = file
        self.file_model = FileModel()


    def save(self, url_id: int):
        if not self.file:
            return None


        file_extension = self.file.filename.split(".")[-1]
        new_filename = uuid4().hex + "." + file_extension

        self.file.save(f"bucket/{new_filename}")

        self.file.filename = new_filename

        self.file_model.filename = new_filename
        
        self.file_model.save(url_id)
