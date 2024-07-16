rm -R -f ./migrations;
dropdb -h localhost -U gitpod example || true;
createdb -h localhost -U gitpod example || true;
psql -h localhost example -U gitpod -c 'CREATE EXTENSION unaccent;' || true;
pipenv run setup;
pipenv run migrate;
pipenv run upgrade;
