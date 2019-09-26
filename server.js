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

io.on("connection", socket => {
  let interval;
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  socket.on("stockName", (stockName) => {
    if (interval) {
      clearInterval(interval);
    }
    else if (stockName === "") { return }
    console.log(stockName)
    getApiAndEmit(socket, stockName)
    interval = setInterval(() => getApiAndEmit(socket, stockName), 5000);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const getApiAndEmit = async (socket, stockName) => {
    try {
      const resPromise = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/quote?token=Tsk_d2f1890612194476b41d39992a3ad835`
      );
      const resPromise1 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/company?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
      );
      const resPromise2 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/dividends/1y?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
      );
      const resPromise3 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/news?token=Tsk_d2f1890612194476b41d39992a3ad835`
      );
      const resPromise4 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/earnings/1/actualEPS?token=Tsk_d2f1890612194476b41d39992a3ad835`
      );
      const resPromise5 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/chart/max?token=Tsk_835d9028dfb54aed86937de0c1f44f8f`
      );
      const resPromise6 = axios.get(
        `https://sandbox.iexapis.com/stable/stock/${stockName}/peers?token=Tsk_d2f1890612194476b41d39992a3ad835`
      );

      const [res, res1, res2, res3, res4, res5, res6] = await Promise.all([resPromise, resPromise1, resPromise2, resPromise3, resPromise4, resPromise5, resPromise6])

      const stockList = {
        companyName: res.data.companyName,
        symbol:res.data.symbol,
        currency:res2.data[0].currency,
        primaryExchange:res.data.primaryExchange,
        latestPrice:res.data.latestPrice,
        latestTime:res.data.latestTime,
        open:res.data.open,
        high:res.data.high,
        low:res.data.low,
        previousClose:res.data.previousClose,
        previousVolume:res.data.previousVolume,
        change:res.data.change,
        changePercent:res.data.changePercent,
        avgTotalVolume:res.data.avgTotalVolume,
        marketCap:res.data.marketCap,
        peRatio:res.data.peRatio,
        week52High:res.data.week52High,
        week52Low:res.data.week52Low,
        ytdChange:res.data.ytdChange,
        isUSMarketOpen:res.data.isUSMarketOpen,
        sector:res1.data.sector,
        website:res1.data.website,
        description:res1.data.description,
        news1:res3.data[0].headline,
        news1Source:res3.data[0].source,
        news2:res3.data[1].headline,
        news2Source:res3.data[1].source,
        news3:res3.data[2].headline,
        news3Source:res3.data[2].source,
        news4:res3.data[3].headline,
        news4Source:res3.data[3].source,
        news5:res3.data[4].headline,
        news5Source:res3.data[4].source,
        EPS: res4.data,
        peers:res6.data.join(',')


      }

      
      const monthData= res5.data.map(data => ({close: data.close, date:data.date}))

      socket.emit("FromAPI", stockList, monthData);
    } catch (error) {
      //TODO: Handle error
      console.error(`Error: ${error}`);
    }
  };