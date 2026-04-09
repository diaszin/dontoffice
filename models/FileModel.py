import duckdb as dbm


class FileModel:
    def __init__(self):
        pass

    def save(self, url_id: int):
        with (
            dbm.connect("urls.duckdb") as conn,
            conn.cursor() as cur,
            open("sql/atualizar-arquivo.sql", "r") as update_sql,
            open("sql/inserir-arquivo.sql", "r") as insert_sql,
        ):
            cur.execute(update_sql.read(), (self.filename, url_id))

            if cur.rowcount == 0:
                cur.execute(insert_sql.read(), (url_id, self.filename))

            conn.commit()
