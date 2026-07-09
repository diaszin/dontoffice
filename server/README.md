# Documentação - API


## Para rodar na máquina local

Para rodar a aplicação na máquina local, siga essas etapas:

Crie um máquina virtual para as dependências
```bash
poetry env use python
```

*Execute o comando novamente* para ativar a máquina virtual

Instale as dependências necessárias

```bash
poetry install
```


Rode a aplicação

```bash
poetry run fastapi dev api
```