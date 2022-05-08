const express = require('express');

const app = express();

const Pool = require('pg').Pool
var connectionParams = null;
if(process.env.DATABASE_URL != null) {
	connectionParams = {
		connectionString: process.env.DATABASE_URL, 
		ssl: {rejectUnauthorized: false }
	}
} else {
	connectionParams = {
		user: 'api_user',
		host: 'localhost',
		database: 'api',
		password: 'password',
		port: 5432
	}
}
const pool = new Pool(connectionParams)

module.exports = pool;
const cors = require('cors');
const port = process.env.PORT || 4000;
const corsOptions = {
  //origin: 'https://team-6-app.herokuapp.com',
  origin: 'http://localhost:8081',
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));

app.use(express.urlencoded({extended: true}))

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
//get all posts
app.get('/', (req, res) => {
  console.log('hello')
  try {
    const sqlQuery = 'SELECT * FROM usertable';
    const queryPost = pool.query(sqlQuery, [], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data);
        // res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

app.get('/getCleaningServices', (req, res) => {
  console.log('Inside getCleaningServices')
  try {
    const sqlQuery = 'SELECT * FROM cleaningservices';
    const queryPost = pool.query(sqlQuery, [], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data);
        // res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});



app.post('/', (req,res) => {
  try {
	console.log('hello idfljglskj')
    const sqlQuery = 'SELECT * FROM usertable WHERE username = $1 AND password = $2';

    const { username, password} = req.body;
    const queryPost = pool.query(sqlQuery, [username, password], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data)
      }
    });

  }catch(err) {
    console.log(err.message)
  }
})
app.get('/options', (req, res) => {
  console.log('hello options')
  try {
    const sqlQuery = 'SELECT * FROM services';
    const queryPost = pool.query(sqlQuery, [], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data);
        // res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
app.get('/getavail', (req, res) => {
  try {
    const sqlQuery = `SELECT A.timestart 
                      FROM timeslot AS A 
                      WHERE dayofweek = (SELECT extract(dow from date '${req.query.date}'))
                      AND A.cid = $1
                      AND timestart NOT IN (SELECT B.time 
                                            FROM appts as B
                                            WHERE B.date = '${req.query.date}'
                                            AND B.cid = A.cid);`;
    const { date, cid} = req.query;
    console.log(date, cid)
    const postCall = pool.query(sqlQuery, [cid], (err, airbnb_results) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(airbnb_results.rows)
        res.send(airbnb_results);
      }
    })
  }
  
  catch (err) {
    console.log(err.message);
  }
});
app.get('/newaccount', (req, res) => {
  console.log('hello')
  try {
    const sqlQuery = 'SELECT * FROM usertable';
    const queryPost = pool.query(sqlQuery, [], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data);
        // res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});



app.post('/newaccount', (req,res) => {
 try {
	console.log('in post newaccount')
    const sqlQuery = 'SELECT * FROM usertable WHERE username = $1';

    const { username} = req.body;
    const queryPost = pool.query(sqlQuery, [username], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else if(result.rows.length == 0){
        console.log(result.rows.length)
		const sqlQueryAccountInsert = 'INSERT INTO usertable (username, password, firstname, lastname) VALUES ($1, $2, $3, $4)'
		const {username, password, firstname, lastname} = req.body
		const postCallAccountInsert = pool.query(sqlQueryAccountInsert, [username, password, firstname, lastname],
        (err, result) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log("Successfully inserted Account: " + result);
			const sqlQueryNewAcc = 'SELECT * FROM usertable WHERE username = $1';
			const { username} = req.body;
			const queryNewAcc = pool.query(sqlQueryNewAcc, [username], (err, results) => {
			if (err) {
				console.log(`Something went wrong while getting all posts:${err.message}`)
			}
			else{
				const data =  results.rows;
				res.send(data)
			}
			});
        }
      });
	  }
	  else{
		  console.log(`username already exists`)
		  req.flash("error", err.message);
          return res.render("/newaccount");
	  }
    });

  }catch(err) {
    console.log(err.message)
  }
});

//get all posts
app.get('/api/post', (req, res) => {
  try {

    const sqlQuery = `SELECT *, to_char(checkoutdate, 'Mon-dd-YYYY') FROM airbnb WHERE uid = $1 ORDER BY checkoutdate ASC`;
    console.log(req.query.uid)
    const queryPost = pool.query(sqlQuery, [req.query.uid], (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
        console.log(result.rows)
        const data =  result.rows;
        res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

app.post('/createReservation', (req, res) => {
  try {
    const sqlQuery = `INSERT INTO airbnb (uid, address, zipcode, checkoutdate, checkouttime, sqft) VALUES ($1, $2, $3, $4, $5, $6) returning rid`
    const {currentUserUID, address, zipcode, checkoutDate, checkoutTime, sqft} = req.body
    const postCall = pool.query(sqlQuery, [currentUserUID, address, zipcode, checkoutDate, checkoutTime, sqft],
        (err, result) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log("Successfully inserted Reservervation into airbnb Table: " + result.rows[0].rid);
            
            const data =  result.rows;
				    res.send(data)
            
          }
        })
  }

  catch (err){
    console.log(err.message);
  }
})

app.get('/getReservations', (req, res) => {
try {

  const sqlQuery = `SELECT * FROM airbnb WHERE uid = $1`;
  const userID = req.body;
  const postCall = pool.query(sqlQuery, [userID], (err, airbnb_results) => {
    if (err) {
      console.log(err.message);
    } else {
      
      res.send(airbnb_results);
    }
  })
}

catch (err) {
  console.log(err.message);
}

})

//get post one by one
app.get('/api/res/one', (req, res) => {
  try {
    console.log(req.query)
    const sqlQuery = `SELECT *, to_char(checkoutdate, 'YYYY-MM-DD') FROM airbnb WHERE rid=$1`;
    const {id} = req.query
    const queryPost = pool.query(sqlQuery, [id], (err, result) => {
      if (err) {
        console.log(`Something went wrong when getting post one by one:${err.message}`)
      } else {
        console.log(result.rows[0])
        const data =  result.rows[0];
        res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

app.get('/api/app/one', (req, res) => {
  try {
    console.log(req.query)
    const sqlQuery = `SELECT *, to_char(date, 'Mon-DD-YY') FROM appts WHERE rid=$1`;
    const {id} = req.query
    const queryPost = pool.query(sqlQuery, [id], (err, result) => {
      if (err) {
        console.log(`Something went wrong when getting post one by one:${err.message}`)
      } else {
        console.log(result.rows[0])
        const data =  result.rows[0];
        res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

//add new post
app.post('/api/create/post', (req,res) => {
  try{

    const sqlQuery = 'INSERT INTO posts (title, author, content) VALUES ($1, $2, $3)';
    const { title, author, content } = req.body;

    const addPost = pool.query(sqlQuery, [title, author, content], (err) => {
      if (err) {
        console.log(`Something went wrong while adding new post:${err.message}`)
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

//Edit post
app.post('/api/edit/post', (req,res) => {
  try{
    console.log(req.body)
    const sqlQuery = 'UPDATE airbnb SET address = $1, zipcode = $2, checkoutdate = $3, checkouttime = $4 WHERE rid = $5';
    const { address, zipcode, checkoutdate, checkouttime, rid } = req.body;
    

    const updatePost = pool.query(sqlQuery, [address, zipcode, checkoutdate, checkouttime, rid], (err) => {
      if (err) {
        console.log(`Something went wrong while editting a post:${err.message}`)
      } else {
        res.send('hello')
        console.log(`succesful update`)
      }
    });
    const sqlQuery2 = 'DELETE FROM appts WHERE rid = $1';
    const deletePost = pool.query(sqlQuery2, [rid], (err) => {
      if (err) {
        console.log(`Something went wrong while deleting a content:${err.message}`)
      } else {
        console.log(`deleting appts`)
      }
    });
  }catch(err) {
    console.log(err.message)
  }
});
//Edit post
app.post('/api/edit/app', (req,res) => {
  try{
    console.log(req.body)
    const sqlQuery = 'UPDATE appts SET date = $1, time = $2 WHERE rid = $3';
    const { date, time, rid } = req.body;
    

    const updatePost = pool.query(sqlQuery, [date, time, rid], (err) => {
      if (err) {
        console.log(`Something went wrong while editting a post:${err.message}`)
      } else {
        res.send('hello')
        console.log(`succesful update`)
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

//Delete post
app.post('/api/delete/post', (req,res) => {
  try{
    console.log('ewhe', req.body)
    const sqlQuery = 'DELETE FROM airbnb WHERE rid = $1';
    const {id} = req.body;

    const deletePost = pool.query(sqlQuery, [id], (err) => {
      if (err) {
        console.log(`Something went wrong while deleting a content:${err.message}`)
      } else {
        res.send('hello')
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});

app.post('/api/complete/post', (req,res) => {
	 try{
    console.log('completing reservation', req.body)
    const sqlQuery = 'DELETE FROM airbnb WHERE rid = $1';
    const {id} = req.body;

    const deletePost = pool.query(sqlQuery, [id], (err) => {
      if (err) {
        console.log(`Something went wrong while deleting a content:${err.message}`)
      } else {
        res.send('hello')
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
//Delete post
app.post('/api/delete/app', (req,res) => {
  try{
    console.log('ewhe', req.body)
    const sqlQuery = 'DELETE FROM appts WHERE rid = $1';
    const {id} = req.body;

    const deletePost = pool.query(sqlQuery, [id], (err) => {
      if (err) {
        console.log(`Something went wrong while deleting a content:${err.message}`)
      } else {
        res.send('hello')
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
app.post('/accountpage', (req, res) => {
  console.log('account settings:', req.body)
  try {
     const sqlQuery = `UPDATE usertable SET password = '${req.body.newpassword}' WHERE username = '${req.body.username}' AND password = '${req.body.oldpassword}'`;
	const {newpassword, username, oldpassword} = req.body;
	console.log(`user : ${req.body.newpassword}`)
    const queryPost = pool.query(sqlQuery,  (err, result) => {
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
		console.log(result)
        const data =  result.rows;
        res.send(data);
        // res.json({data})
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
app.post('/deleteaccount', (req,res) =>{
	try{
	const {username} = req.body;
	const sqlQuery = `DELETE FROM usertable WHERE username = '${req.body.username}'`;
	const queryPost = pool.query(sqlQuery, (err,result) =>{
		if(err){
		console.log(`something went wrong with delete`)}
		else{
			const sqlQueryAirbnb = `DELETE FROM airbnb WHERE uid = '${req.body.username}'`;
			const queryPostAirbnb = pool.query(sqlQueryAirbnb, (err, result) =>{
				if(err){
					console.log(`something went wrong with delete`)}
			});
			console.log(result)
			const data =  result.rows;
        res.send(data);}
	
});
	}catch(err) {
    console.log(err.message)
  }
});
app.post('/finalize', (req,res) =>{
  console.log(req.body)
  try{

    const sqlQuery = 'INSERT INTO appts (rid, cid, time, date, price) VALUES ($1, $2, $3, $4, $5)';
    const { rid, cid, time, date, price} = req.body;

    const addPost = pool.query(sqlQuery, [rid, cid, time, date, price], (err) => {
      if (err) {
        console.log(`Something went wrong while adding new post:${err.message}`)
      } else {
        res.send('hello')
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
 
app.get('/createrate', (req, res) =>{
	try{
		
		const sqlQuery = ' select cleaningservices.name, cleaningservices.id, appts.date from airbnb inner join appts on airbnb.rid = appts.rid inner join cleaningservices on name = appts.cid where airbnb.rid = $1';
		console.log('the res is :' + req.query.rid)
		const {rid} = req.query;
		const queryGet = pool.query(sqlQuery, [rid], (err, result) =>{
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
		console.log(result.rows[0])
        const data =  result.rows[0];
        res.send(data);
		
       
      }
    });

  }catch(err) {
    console.log(err.message)
  }
	
});
app.get('/createratereview', (req, res) =>{
	try{
		
		const sqlQuery = ' select cleaningservices.name, cleaningservices.id, appts.date from airbnb inner join appts on airbnb.rid = appts.rid inner join cleaningservices on name = appts.cid where airbnb.rid = $1';
		console.log('the res is :' + req.query.rid)
		const {rid} = req.query;
		const queryGet = pool.query(sqlQuery, [rid], (err, result) =>{
      if (err) {
        console.log(`Something went wrong while getting all posts:${err.message}`)
      } else {
		console.log(result.rows[0])
        const data =  result.rows[0];
        res.send(data);
		
       
      }
    });

  }catch(err) {
    console.log(err.message)
  }
	
});
app.post('/createratereview', (req,res)=>{
	try{
		const sqlQuery = 'INSERT INTO reviewsystem (cid, userid, resid, review, subject, apptdate ) VALUES ($1, $2, $3, $4, $5, $6)';
		const {cid, id, rid, review, subject, date} = req.body;
		console.log(' the id is : ' + req.body.id)
		console.log(' the rid is : ' + req.body.rid)
		const addReview = pool.query(sqlQuery,[cid, id, rid, review, subject, date], (err, result) => {
      if (err) {
        console.log(`Something went wrong while adding new review: ${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data)
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});
app.post('/createrate', (req,res)=>{
	try{
		const sqlQuery = 'INSERT INTO ratingsystem (cid, cleanliness, resid, speed, punctuality, professionalism, userid, apptdate ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
		const {cid, clean, rid, speed, pun, pro, id, date} = req.body;
		console.log(' the id is : ' + req.body.id)
		console.log(' the rid is : ' + req.body.rid)
		console.log(' the clean is : ' + req.body.clean)
		const addReview = pool.query(sqlQuery,[cid, clean, rid, speed, pun, pro, id, date], (err, result) => {
      if (err) {
        console.log(`Something went wrong while adding new review: ${err.message}`)
      } else {
        const data =  result.rows;
        res.send(data)
      }
    });

  }catch(err) {
    console.log(err.message)
  }
});