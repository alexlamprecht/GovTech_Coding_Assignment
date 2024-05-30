# GovTech Coding Assignment

## Assignment 


### Background

A school needs a system where administrators can perform administrative functions for teachers and students. Teachers and students are identified by their email addresses.

### Your Task

Your task is to:

1. Develop a set of API endpoints, listed under _User Stories_ below, for adminstrators to perform administrative functions for their classes.
   - Your code must be hosted on Github, or any other similar service, in a publicly-accessible repository.
   - You may assume that login and access control have already been handled.
2. _(Optional)_ Deploy your API to any publicly accessible hosting environment.

When you have completed your assignment, before the given deadline, please submit to us a link to your code repository.

If you have any queries, feel free to contact us.

### Requirements/Expectations

1. Your code repository should contain a `README.md` that includes the following:
   - Link(s) to the hosted API (if applicable)
   - Instructions for running local instance of your API server; we need to minimally be able to launch and test your solution locally
2. Please use Nest.js (preferred. If you wish to use another backend technology, please check with us) for the backend code.
3. Please use a local Dynamodb as the database.
4. Please include unit tests.
   - (Optional) You can provide a Postman collection for the APIs that you've implemented, _but_ we can (and likely will) still use our own tools as well to test your API.
5. For the follow-up submission review session, you should be prepared to:
   - Walk through your code to interviewers
   - Explain any design decisions you’ve made

### Important!

- We will assess your submission holistically (i.e. not just in terms of functionality), including factors such as:
  - Readability and code cleanliness
  - Secure coding practices
  - Code structure/design, e.g. modularity, testability, performance
  - Class and DB design
- **Please adhere closely to the given specs**.
  - Please do not omitted any user stories

### User stories

#### 1. As an administrator, I want to add new students to the system.

- To add a student
  - Endpoint: `POST /api/students`
  - Headers: `Content-Type: application/json`
  - Success response status: HTTP 201
  - Request body example:

```
{
  "email" : "studentjane@gmail.com"
  "name" : "Jane"
}
```

#### 2. As an administrator, I want to add new teachers to the system.

- To add a teacher
  - Endpoint: `POST /api/teachers`
  - Headers: `Content-Type: application/json`
  - Success response status: HTTP 201
  - Request body example:

```
{
  "email" : "teachermary@gmail.com"
  "name" : "Mary"
}
```

#### 3. As an administrator, I want to register one or more students to a specified teacher.

A teacher can register multiple students. A student can also be registered to multiple teachers.

- Endpoint: `POST /api/register`
- Headers: `Content-Type: application/json`
- Success response status: HTTP 204
- Request body example:

```
{
  "teacher": "teacherken@gmail.com"
  "students":
    [
      "studentjon@gmail.com",
      "studenthon@gmail.com"
    ]
}
```

#### 4. As an administrator, I want to de-register a student to a specified teacher.

- Endpoint: `POST /api/deregister`
- Headers: `Content-Type: application/json`
- Success response status: HTTP 200
- Request body example:

```
{
  "teacher": "teacherken@gmail.com",
  "student": "studentjon@gmail.com",
  "reason": "Cancelled enrollment"
}
```

#### 5. As an administrator, I want to retrieve a list of students common to a given list of teachers (i.e. retrieve students who are registered to ALL of the given teachers).

- Endpoint: `GET /api/commonstudents`
- Headers: `Content-Type: application/json`
- Success response status: HTTP 200
- Request example 1: `GET /api/commonstudents?teacher=teacherken%40gmail.com`
- Success response body 1:

```
{
  "students" :
    [
      "commonstudent1@gmail.com",
      "commonstudent2@gmail.com",
      "teacherkenstudent1@gmail.com"
      "teacherkenstudent2@gmail.com"
    ]
}
```

- Request example 2: `GET /api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com`
- Success response body 2:

```
{
  "students" :
    [
      "commonstudent1@gmail.com",
      "commonstudent2@gmail.com"
    ]
}
```

#### 6. As a adminstrator, I want to list all teachers, together with a list of email addresses of students registered to each teacher

- Endpoint: `GET /api/teachers`
- Headers: `Content-Type: application/json`
- Success response status: HTTP 200
- Request example 1: `GET /api/teachers`
- Success response body:

```
{
  "teachers":
    [
      {
         "email": "teachermary@gmail.com",
         "students" :
             [
               "studentjane@gmail.com",
               "studentjon@gmail.com"
             ]
      },
      {
         "email": "teacherken@gmail.com",
         "students" : [...]
      },
      ...
    ]

}
```

### Error Responses

For all the above API endpoints, error responses should:

- have an appropriate HTTP response code
- have a JSON response body containing a meaningful error message:

```
{ "message": "Some meaningful error message" }
```


## Solution

### Implementation Considerations
- Using NestJs as per requirement
- Using npm for this project for simplicity
- Using docker to provide a container for the DynamoDB local database so it does not need to be installed locally
- Using environment variables to handle configurations and secrets
- Using `class-validator` and `class-transformer` to validate API inputs and registering a global ValidationPipe
- Setting a global prefix for all API routes `api`

### DB implementation considerations
- NoSQL Database
- avoiding to handle registrations by having students in the teacher table and teachers in the student table to minimize query complexity and maintain atomicity
- instead using three Tables:
  -  Students 
  -  Teachers
  -  Registrations
  
#### Students Table 
- Primary Key: `email` (Partition Key)
  
#### Teachers Table 
- Primary Key: `email` (Partition Key)
  
#### Registration Table 
- Primary Key: `teacherEmail` (Partition Key) and `studentEmail` (Sort Key)

### Implementation Steps

1) Create a new repository
2) Create new Nest.JS Project
3) Install docker and pull the dynamodb-local image
4) Install the AWS SDK v3, so it can be used to interface with the Database
5) Install dotenv-cli to handle environment files
5) Install `class-validator` and `class-transformer` to handle the input validation pipeline


### Installation & Usage
- Make sure to have docker or podman installed
- Make sure to have npm and Node.Js installed
- Clone the repository
- Use `docker pull amazon/dynamodb-local` to pull the DynamoDB local Docker image. 
- make sure to add the proper values to the `.env.local` file:
  ```json
  API_PORT=3000
  AWS_REGION="localhost"
  AWS_ENDPOINT="http://localhost:8000"

#### Run Locally
- run `npm install` to install necessary dependencies.
- run `npm run start:dev` to start server in watch mode. This also automatically starts the docker container containing the database and initializes it.
- run `npm run test:cov` to run all tests with coverage
- the API is available at http://localhost:3000/
- visit http://localhost:3000/api/heartbeat to confirm proper functionality
