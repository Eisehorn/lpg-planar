# Lpg Planar

## 1) How to start the container / Launch the project in local

To create and start the container, download the provided backend.env, frontend.env and postgres.env and place them in the root of the project ( ~/lpg-planar ); afterwards jsut run `docker compose up --build` with Docker Desktop open and the containers will be created and linked.

To start the project just in local, instead, you need to put the provided .env in ~/lpg-planar/backend and another .env (that is the same as frontend.env for now) in ~/lpg-planar/frontend.
You probably still need to run the postgres container (to be verified). At this point open two different terminals, one in ~/lpg-planar/backend in which you'll run `npm run start:dev` and one in ~/lpg-planar/frontend in which you'll run `npm run dev`.

While either of this method is running, you can access the build at `http://localhost:6969`

## 2) Github use

Regarding Github, **nobody** can work on the master branch. Everyone will have his own branch made like `develop-fgiuliano`, where he should follow this few steps:

- make sure to be on his own branch `ex: git checkout develpo-fgiuliano`
- pull the changes from the develop branch `ex: git pull develop develop-fgiuliano`
- work on whatever
- add the changes made `ex: git add . (or git add filenames to be safer)`
- commit the changes using the issue number you've worked on `ex: git commit -m 'iss_001'`
- push on your personal branch `ex: git push origin develop-fgiuliano`
- create a merge request on Github (wether the Desktop App or the site), asking to merge the personal branch in **develop**

## 3) Stack to use

As discussed, the stack used for the frontend will be React, while the backend will be made in NodeJs. The two will interact with the axios library, that will handle API calls.

[![My Skills](https://skillicons.dev/icons?i=react,nodejs)](https://skillicons.dev)

The Database will be a Postgres one that will interact, **with the backend only**, through Prisma.

[![My Skills](https://skillicons.dev/icons?i=postgres,prisma)](https://skillicons.dev)
