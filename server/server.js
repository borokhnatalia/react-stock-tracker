// Data feed imports
const { sectorInformation } = require("./components/sectorInformation");
const { topPeers } = require("./components/topPeers");
const { companyOverview } = require("./components/companyOverview");
const { latestNewsInterval } = require("./components/latestNewsInterval");
const { keyStats } = require("./components/keyStats");
const { stockTicker } = require("./components/stockTicker");
const { chartData } = require("./components/chartData");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4000;
const index = require("./routes");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

const oneDay = 24 * 60 * 60 * 1000;

function callAndStartIntervals(fn, interval, ...args) {
  fn(...args);
  return setInterval(() => fn(...args), interval);
}

io.on("connection", socket => {
  const timerIDs = {};
  const allSymbols = getCompanySymbols();
  console.info("New client connected");
  socket.on("stockName", async (stockName, timeRange) => {
    if (stockName === "") {
      return false;
    }
    console.info("Stock entered: ", stockName);

    Object.values(timerIDs).forEach(clearInterval);

    timerIDs.stockTicker = callAndStartIntervals(
      stockTicker,
      5000,
      socket,
      stockName,
      HOST,
      TOKEN
    );
    timerIDs.keyStats = callAndStartIntervals(
      keyStats,
      oneDay,
      socket,
      stockName,
      HOST,
      TOKEN
    );
    timerIDs.latestNews = callAndStartIntervals(
      latestNewsInterval,
      oneDay,
      socket,
      stockName,
      HOST,
      TOKEN
    );
    timerIDs.companyOverview = callAndStartIntervals(
      companyOverview,
      oneDay,
      socket,
      stockName,
      HOST,
      TOKEN
    );
    timerIDs.topPeers = callAndStartIntervals(
      topPeers,
      oneDay,
      socket,
      stockName,
      HOST,
      TOKEN,
      allSymbols
    );
    timerIDs.chartData = callAndStartIntervals(
      chartData,
      oneDay,
      socket,
      stockName,
      timeRange,
      HOST,
      TOKEN
    );
    timerIDs.sectorInformation = callAndStartIntervals(
      sectorInformation,
      oneDay,
      socket,
      stockName,
      HOST,
      TOKEN
    );
  });

  socket.on("searchQuery", inputQuery => {
    searchQuery(socket, inputQuery, allSymbols);
  });

  socket.on("timeRange", (stockName, timeRange) => {
    chartData(socket, stockName, timeRange, HOST, TOKEN);
  });

  socket.on("disconnect", () => {
    Object.values(timerIDs).forEach(clearInterval);
    console.info("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const HOST = "https://sandbox.iexapis.com/stable";
const TOKEN = "Tsk_d2f1890612194476b41d39992a3ad835";

const getCompanySymbols = async () => {
  try {
    const companySymbols = await axios.get(
      `${HOST}/ref-data/symbols?token=${TOKEN}`
    );

    return companySymbols.data.map(data => ({
      symbol: data.symbol,
      name: data.name,
      exchange: data.exchange
    }));
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const searchQuery = async (socket, inputQuery, allSymbols) => {
  try {
    const symbols = await allSymbols;
    const filteredData = symbols.filter(
      search =>
        search.symbol.toLowerCase().indexOf(inputQuery.toLowerCase()) !== -1 ||
        search.name.toLowerCase().indexOf(inputQuery.toLowerCase()) !== -1
    );
    const topTen = filteredData.slice(0, 10);
    socket.emit("companySymbols", topTen);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
