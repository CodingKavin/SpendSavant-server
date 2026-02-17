# instock-server

A working API for the InStock application. Repo for the client side application can be found at the link below:

https://github.com/kathy-codes/instock-client


## Quick Start

To set up node packages, run the command below:

```bash
npm install
```

### Best Practices & Development Tips

**Setting up the mysql database**
- To intialize the databse, execute ```npm run database``` in the server root folder

**Local Port & Client Side Connection**
- Client side connects to the API through the port set on your server side .env file
- Make sure you start the API before your client side connects

**Common Scripts**
- ```npm run dev``` starts the API and watches for changes to the code
- ```npm run start``` starts the API and DOES NOT watch for changes to the code
- ```npm run database``` initializes the warehouses and inventories databases

**Miscellanous Items**
- Use Postman or another API development platform to test the API
- .env should be included in .gitignore if pushed into production
- Make sure all packages are installed before running the server
- ```npm run database``` will reset the database in development