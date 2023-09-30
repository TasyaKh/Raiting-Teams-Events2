# Сервер

На заметку:
пароль во всех учетках "123", заходим по username
![image](https://user-images.githubusercontent.com/74527737/222896661-048ae0a0-723c-40ee-886a-be53151b1b9c.png)


## Установка через npm

```bash
$ npm install

$ npm install --save @nestjs/typeorm typeorm postgres
```

## Установка через yarn

```bash
$ yarn && yarn start
```

#### Так же необходимо иметь PostgreSQL с развернутым бэкапом БД (pgadmin) (windows)
backup.sql файл в папке server

1. Создаем пустую БД с названием raiting_teams_events

2. Правой кнопкой кликаем на базу и выбираем PSQL Tool

3. И там пишем команду

     \i 'd:/пусть/к/файлу/бекапу.sql'

     Наклон слешей должен быть вправо

     Например:

     \i 'C:/Users/Yulia/Study/Raiting-Teams-Events/backup.sql'


#### Подготовка БД через консоль (linux)

1. установить postgresql, например v14.9
2. зайти под psql
```
$ sudo -u postgres psql
```

3. создать БД

```
# create DATABASE raiting_team_events;
```

4. установить дефолтный пароль для СУБД к БД

```
# ALTER USER postgres WITH PASSWORD 'root';
```

5. выйти из под psql

```
# \q
```

6. заполнить БД бэкапом
```
sudo -u postgres psql -d raiting_team_events < backup.sql
```

#### Файл .env (настройка подкл. к БД)
Нужно переименовать файл .env.example в папке server в .env и изменить конфигурацию при необходимости

## Running the app

### npm
запуск сервера
```bash
$ кnpm run start:dev
```

### yarn
```bash
$ yarn start
```

# Доп. инфа

## Документация
Swagger - документированые api-шки, http://localhost:3000/documentation

## Создание бэкапа

Как сделать из pgAdmin

1. Тыкаем на базу backup
2. Выбираем формат Plain
3. Выбираем путь к файлу (будем делать sql файл)
4. Во вкладке options включаем Include DROP DATABASE statement
5. Запускаем Backup

## Деплой
Ссылка на API :http://rating-teams-events.ovz1.j37315531.m1yvm.vps.myjino.ru/api/

Делаем 
```bash
cd Raiting-Teams-Events
git pull

```
Для клиента:

```bash
cd client
npm install
npm run build

```

Для сервера
```bash
cd server
npm install
npm run build
pm2 restart api-Raiting-Teams-Events

```

Распаковка бэкапа БД
```bash
psql
\c raiting_teams_events
\i 'backup.sql'
```
*что бы выйти из режима работы с БД нажать CTRL+Z


## Лайфхаки

Заполнить бэкап данными, генератор
https://poe.com/chatgpt

## Файлы на сервере

сохраняются в папку public/media/{год.месяц}/{день}  - статичная папка на сервере
uploads (папка) - отвечает за выгрузку и загрузку файлов на сервер, папки генерятся сами

> важная ссылка: https://stackoverflow.com/questions/68019001/how-to-get-serve-static-images-nestjs

