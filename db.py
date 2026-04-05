import duckdb as dbm


with dbm.connect('urls.duckdb') as conn:
    cursor = conn.cursor()
    cursor.execute(open('sql/create-table-url.sql').read())


print("A tabela de URLS criada !")

