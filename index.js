/**
 * Returns an array of 15 numbers:
 *   [0]  → 2000n (BigInt)
 *   [14] → 2048  (Number)
 *   [1]…[13] → random integers 1990 ≤ n ≤ 2056
 *
 * @param {number} [min=1990] - lower bound for the random values
 * @param {number} [max=2056] - upper bound for the random values
 * @returns {Array<number|bigint>} array with 15 elements
 */

const mongoose = require("mongoose")
const exp = require('express')
const cron = require('node-cron');
function createFifteenNumbers(begin, end, min, max) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error('Invalid range: min must be an integer ≤ max');
  }

  const randomInt = () => Math.floor(Math.random() * (max - min + 1)) + min;

  const arr = new Array(15);
  arr[0] = begin                // first element – BigInt
  arr[14] = end;                // last element – Number

  // fill the 13 middle slots with random integers
  for (let i = 1; i <= 13; i++) {
    arr[i] = randomInt();
  }
  return arr;
}

/* ------------------- Example usage ------------------- */
//const result = createFifteenNumbers();
// console.log(result);
// Example output:
// [
//   2000n,
//   2032, 1995, 2051, 2011, 2044, 2003, 1992, 2056, 2027, 2009, 2041, 1998,
//   2048
// ]

function getRandomNumber(min = 200, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Usage
const randomNum = getRandomNumber();
//console.log(randomNum); // e.g., 4567

const randomPercentage = () => {
  let temp = getRandomNumber(90, 120);
  return (temp / 100)
}

const getFraction = () => {
  const temp = getRandomNumber(5, 10)
  return (temp / 100)
}
//console.log(randomPercentage())
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://rakeshkrishnanp_db_user:alphabeta123@cluster0.c5goorl.mongodb.net/?appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
connectDB()

const symbolSchema = new mongoose.Schema({
  Symbol: {
    type: String,
  },
  Values: [Number],
  Rank: Number,
  Name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
const Symbol = mongoose.model('symbol', symbolSchema);

// function main() {
//   const begin = getRandomNumber()
//   const end = Math.round(begin * randomPercentage())

//   let min = 0
//   let max = 0
//   if (begin < end) {

//     min = begin - Math.round((getFraction() * begin))
//     max = end + Math.round((getFraction() * end))
//   } else {
//     min = end - Math.round(getFraction() * end)
//     max = begin + Math.round((getFraction() * begin))
//   }


//   const arr = createFifteenNumbers(begin, end, min, max)

//   return arr
// }

// async function Store() {
//   await Symbol.find().then((data) => {
//     if (Array.isArray(data)) {
//       data.forEach(async (item) => {
//         let arr = main()
//         await Symbol.updateOne({ Symbol: item.Symbol }, { $set: { Values: arr } })
//       })
//     }
//   })
// }
//Store()
async function assignRank() {
  let data = await Symbol.find();
  data.forEach(async(elem) => {
    data = elem
    let symbol = data["Symbol"]
    data = data["Values"];
    let rank = 1
    let average = 0

    for (x = data.length - 1; x > 0; x--) {
      let value = data[x];
      let temp = data[x - 1]
      average = average = average + Math.abs(value - temp)
      if (temp > value) {
        rank = rank + 1
      }
    }
    average = average / data?.length

    for (x = data.length - 1; x > 0; x--) {
      let value = data[x];
      let temp = data[x - 1]
      let delta = parseInt(Math.abs(average - Math.abs(value - temp)))
      rank = parseFloat(rank) + parseFloat(delta / average)
    }

    await Symbol.updateOne({ Symbol: symbol }, { $set: { Rank: parseInt(rank) } })
  })

}

const reset = async()=> {
  await Symbol.updateMany({},{$set:{Values:[]}})
}

const app = exp();

app.get("/reset",async(req,res)=> {
  await reset()
  res.send('reset')
})

app.get("/data",async(req,res)=> {
  let data = await Symbol.find().sort({Rank:1})
  data = data?.filter((item)=> item?.Values?.length > 8)
  res.send(data)
})

app.listen(3000,()=> {console.log("started")})

 cron.schedule('19 9 * * *', () => {
      console.log('Running a daily task at 9 AM:', new Date().toLocaleString());
      reset()
      // For example, you could call a function to perform a specific operation
      // myFunctionToRunDaily();
    });

   cron.schedule('35 10 * * *', () => {
        console.log('Running a task daily at 10:30 AM');
        // Place your desired logic here
        // For example, calling a function, processing data, etc.
        assignRank()
    });




