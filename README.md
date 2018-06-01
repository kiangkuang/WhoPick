# WhoPick

## Usage
1. Install dependencies
    ```
    yarn install
    ```
2. Set up environment variables file
    ```
    yarn setup
    ```
3. Open `.env` file and replace `<token>` and `<db url>` with the real bot token and MySQL DB URL

4. Create DB
    ```    
    yarn create-db
    ``` 
5. Run DB migrations
    ```
    yarn migrate
    ```
6. Start Node.js server 
    ```
    yarn start
    ```