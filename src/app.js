const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const itemRouter =require('./routers/item')
const cartRouter = require('./routers/cart')

const app = express();
app.use(express.json());

app.use(userRouter)
app.use(itemRouter)
app.use(cartRouter)

const port = process.env.PORT;

app.listen(port, () => {
    // Bash Color Flag: \x1B[35m => makes the command color 'magenta'
    console.log(`\x1B[35mServer listening on port: ${port}`);
})