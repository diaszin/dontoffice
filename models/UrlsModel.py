import duckdb as dbm


class UrlsModel:
    def __init__(self, secret_page_name):
        self.secret_page_name = secret_page_name

    def create(self):
        with (
            dbm.connect("urls.duckdb") as conn,
            open("sql/inserir-url.sql", "r") as sql,
            open("sql/buscar-url.sql", "r") as search_sql,
        ):
            cursor = conn.cursor()
            result = self.read_one()
            if result is None:
                cursor.execute(sql.read(), (self.secret_page_name,))
                conn.commit()

                result = self.read_one()
                return result[0]
            

            return result[0]

    def read_all(self):
        with (
            dbm.connect("urls.duckdb") as conn,
            open("sql/buscar-todas-urls.sql", "r") as sql,
        ):
            cursor = conn.cursor()
            cursor.execute(sql.read())
            return cursor.fetchall()

    def read_one(self):
        with dbm.connect("urls.duckdb") as conn, open("sql/buscar-url.sql", "r") as sql:
            cursor = conn.cursor()
            cursor.execute(sql.read(), (self.secret_page_name,))
            return cursor.fetchone()

    def update(self):
        with (
            dbm.connect("urls.duckdb") as conn,
            open("sql/atualizar-url.sql", "r") as sql,
        ):
            cursor = conn.cursor()
            cursor.execute(sql.read(), (self.secret_page_name, self.secret_page_name))
            conn.commit()

    def delete(self):
        with (
            dbm.connect("urls.duckdb") as conn,
            open("sql/deletar-url.sql", "r") as sql,
        ):
            cursor = conn.cursor()
            cursor.execute(sql.read(), (self.secret_page_name,))
            conn.commit()
