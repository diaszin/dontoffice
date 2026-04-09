from models.UrlsModel import UrlsModel
class UrlsController:
    def __init__(self, secret_page_name: str):
        self.urls = UrlsModel(secret_page_name)

    def create(self):
        return self.urls.create()

    def read(self):
        return self.urls.read()

    def update(self):
        self.urls.update()

    def delete(self):
        self.urls.delete()

    def read_one(self):
        return self.urls.read_one()