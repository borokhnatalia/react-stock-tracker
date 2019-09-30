const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4000;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", async socket => {
  const timerIDs = {}
  console.log("New client connected");
  socket.on("stockName", (stockName, timeRange) => {
    clearInterval(timerIDs.daily);
    clearInterval(timerIDs.realTime);
    if (stockName === "") { return }
    console.log("Stock entered: ", stockName)

    let dailyList = await dailyInterval(socket, stockName, timeRange);
    let realTimeList = await realTimeInterval(socket, stockName);

    function updateUI() {
      const returnedTarget = Object.assign(dailyList, realTimeList);

      Object.keys(returnedTarget).forEach(item => {
        if (returnedTarget[item] === null) {
          returnedTarget[item] = 'N/A'
        }
        else if (item === true) {
          returnedTarget[item] = 'True'
        }
        else if (item === false) {
          returnedTarget[item] = 'False'
        }
      })

      socket.emit("FromAPI", returnedTarget);
    }

    timerIDs.realTime = setInterval(async () => {
      realTimeList = await realTimeInterval(socket, stockName);
      updateUI();
    }, 5000);
    timerIDs.daily = setInterval(async () => {
      dailyList = await dailyInterval(socket, stockName);
      updateUI();
    }, 86400000);

    updateUI();
  });

  socket.on('timeRange', (stockName, timeRange) => {
     dailyInterval(socket, stockName, timeRange);
  });

  socket.on("disconnect", () => {
    clearInterval(timerIDs.realTime, timerIDs.daily);
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const HOST = 'https://sandbox.iexapis.com/stable/stock/'

const dailyInterval = async (socket, stockName, timeRange) => {
  
  let monthData;
  const start = Date.now();
  console.log("Daily interval loading...", start);
  try {
    const quote = axios.get(
      `${HOST}${stockName}/quote?token=Tsk_d2f1890612194476b41d39992a3ad835`
    );
    const company = axios.get(
      `${HOST}${stockName}/company?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
    );
    const dividends = axios.get(
      `${HOST}${stockName}/dividends/1y?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
    );
    const news = axios.get(
      `${HOST}${stockName}/news?token=Tsk_d2f1890612194476b41d39992a3ad835`
    );
    const earnings = axios.get(
      `${HOST}${stockName}/earnings/1/actualEPS?token=Tsk_d2f1890612194476b41d39992a3ad835`
    );
    const chart = axios.get(
      `${HOST}${stockName}/chart/${timeRange}?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
    );
    const peers = axios.get(
      `${HOST}${stockName}/peers?token=Tsk_d2f1890612194476b41d39992a3ad835`
    );
    const companySymbols = axios.get(
      `https://sandbox.iexapis.com/stable//ref-data/symbols?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
    )

    const [res, res1, res2, res3, res4, res5, res6, res7] = await Promise.all([quote, company, dividends, news, earnings, chart, peers, companySymbols])
    console.log("Data is back", Date.now() - start);
    const { companyName, symbol, primaryExchange, open, high, low, previousClose, previousVolume, avgTotalVolume, marketCap, peRatio, week52High, week52Low, ytdChange, isUSMarketOpen } = res.data
    const { sector, website, description } = res1.data
    const { currency } = res2.data[0]

    const allSymbol = res7.data.map(data => (data.symbol))

    monthData = res5.data.map(data => ({ close: data.close, date: data.date }))
  

    return {
      companyName,
      symbol,
      currency,
      primaryExchange,
      open,
      high,
      low,
      previousClose,
      previousVolume,
      avgTotalVolume,
      marketCap,
      peRatio,
      week52High,
      week52Low,
      ytdChange,
      isUSMarketOpen,
      sector,
      website,
      description,
      EPS: res4.data,
      news1: res3.data[0].headline,
      news1Source: res3.data[0].source,
      news2: res3.data[1].headline,
      news2Source: res3.data[1].source,
      news3: res3.data[2].headline,
      news3Source: res3.data[2].source,
      news4: res3.data[3].headline,
      news4Source: res3.data[3].source,
      news5: res3.data[4].headline,
      news5Source: res3.data[4].source,
      peers: res6.data.join(','),
      monthData: monthData
    }
  } catch (error) {
    //TODO: Handle error
    console.error(`Error: ${error}`);
  }
};

const realTimeInterval = async (socket, stockName) => {
  console.log("Real time interval loading...");
  console.log("...");
  const start = Date.now();
  try {
    const quote = axios.get(
      `https://sandbox.iexapis.com/stable/stock/${stockName}/quote?token=Tsk_d2f1890612194476b41d39992a3ad835`
    );

    const [res] = await Promise.all([quote])
    const { latestPrice, latestTime, change, changePercent } = res.data;

    console.log("Data is back", Date.now() - start);

    return {
      latestPrice,
      latestTime,
      change,
      changePercent
    }
  } catch (error) {
    //TODO: Handle error
    console.error(`Error: ${error}`);
  }
};


