
function submit_button() {

  document.getElementById("rev-form").addEventListener("click", function (event) {
    event.preventDefault()
  });

  var income = document.getElementById("revenues").value / 1000000,
    cost = document.getElementById("expences").value / 1000000,
    ebita = income - cost,
    income_prosent = [document.getElementById("nok_in").value / 100, document.getElementById("sek_in").value / 100, document.getElementById("dkk_in").value / 100, document.getElementById("usd_in").value / 100, document.getElementById("eur_in").value / 100],
    cost_prosent = [document.getElementById("nok_out").value / 100, document.getElementById("sek_out").value / 100, document.getElementById("dkk_out").value / 100, document.getElementById("usd_out").value / 100, document.getElementById("eur_out").value / 100],
    ant_valuta = 5; //income_prosent.length,
  corr = 0,
    output = 0,
    net = Array.apply(null, Array(ant_valuta)).map(Number.prototype.valueOf, 0),
    in_volatility = [0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    hedge_ratio = document.getElementById("hedge-ratio").value / 100,
    years = document.getElementById("years").value;

  //make_graph(income, cost, ant_valuta, income_prosent, cost_prosent);
  for (var i = 0; i < ant_valuta; i++) {
    net[i] = [(income * income_prosent[i] - cost * cost_prosent[i])];
  }

  for (var i = 1; i < ant_valuta; i++) {
    for (var j = 1; j < ant_valuta; j++) {
      if (i == j ? corr = 1 : corr = 0.5);
      output = output + (in_volatility[i] * net[i] * in_volatility[j] * net[j] * corr)
    }
  }
  output = Math.pow(output, 0.5);

  var nintyfive = -1.644853627,
    ninty = -1.281551566,
    eighty = -0.841621234,
    twenty = 0.841621234,
    ten = 1.281551566,
    five = 1.644853627,
    pointsTop = [[0, ebita]],
    pointsBottom = [[0, ebita]],
    points95 = [{ x: 0, low: ebita, high: ebita }],
    points90 = [{ x: 0, low: ebita, high: ebita }],
    points80 = [{ x: 0, low: ebita, high: ebita }],
    points20 = [{ x: 0, low: ebita, high: ebita }],
    points10 = [{ x: 0, low: ebita, high: ebita }],
    points5 = [{ x: 0, low: ebita, high: ebita }],
    line = [{ x: 0, low: ebita, high: ebita }];

  for (var time = 1; time <= 21; time++) {
    if (time <= years * 4) {
      vifte95 = ebita + nintyfive * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      vifte90 = ebita + ninty * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      vifte80 = ebita + eighty * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      vifte20 = ebita + twenty * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      vifte10 = ebita + ten * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      vifte5 = ebita + five * Math.pow((time / 4), 0.5) * output * (1 - hedge_ratio);
      bottom = ebita + five * Math.pow((time / 4), 0.5) * output;
      top = ebita + nintyfive * Math.pow((time / 4), 0.5) * output;
    } else {
      vifte95 = ebita + nintyfive * Math.pow((time / 4), 0.5) * output;
      vifte90 = ebita + ninty * Math.pow((time / 4), 0.5) * output;
      vifte80 = ebita + eighty * Math.pow((time / 4), 0.5) * output;
      vifte20 = ebita + twenty * Math.pow((time / 4), 0.5) * output;
      vifte10 = ebita + ten * Math.pow((time / 4), 0.5) * output;
      vifte5 = ebita + five * Math.pow((time / 4), 0.5) * output;
      bottom = vifte5;
      top = vifte95;
    }


    line.push({ x: time * 40, low: (ebita - 0.5), high: (ebita + 0.5) })
    point5 = { x: time * 40, low: vifte10, high: vifte5 }
    point10 = { x: time * 40, low: vifte20, high: vifte10 }
    point20 = { x: time * 40, low: vifte80, high: vifte20 }
    point80 = { x: time * 40, low: vifte90, high: vifte80 }
    point90 = { x: time * 40, low: vifte95, high: vifte90 }
    point95 = { x: time * 40, low: 0, high: vifte95 }

    pointsTop.push([time * 40, top])
    pointsBottom.push([time * 40, bottom])

    points5.push(point5)
    points10.push(point10)
    points20.push(point20)
    points80.push(point80)
    points90.push(point90)
    points95.push(point95)
    //vifte80 = ebita + eighty * (time/4) * output;
  }

  var svg = d3.select("#svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  svg.selectAll("*").remove();

  var xScale = d3.scaleTime().rangeRound([0, width]);

  var yScale = d3.scaleLinear().domain([0, 300]).range([600, 100]);



  // Add the X Axis
  svg.append("g")
    .attr("class", "axis xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)
      .tickFormat(function (x) {

        //Milliseconds since Epoch
        var milli = (x.getTime());
        var vanilli = new Date(milli);
        var month = vanilli.getMonth();

        console.log(x);

        if (month <= 2) {
          return "Q1";
        } else if (month <= 5) {
          return "Q2";
        } else if (month <= 8) {
          return "Q3";
        } else {
          return "Q4";
        }

      }))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em");

  // Add the Y Axis
  svg.append("g")
    .attr("class", "axis yAxis")
    .call(d3.axisLeft(yScale)
      .tickFormat(function (x) {
        console.log(x);
        return x;
      }))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "1em")
    .attr("dy", "0em")
    .attr("transform", "rotate(0)");

  var mindate = new Date(2012, 0, 1),
    maxdate = new Date(2012, 0, 31);

  var lineGenerator = d3.line();

  var areaGenerator = d3.area()
    .x(function (d) {
      return d.x;
    })
    .y0(function (d) {
      return yScale(d.low);
    })
    .y1(function (d) {
      return yScale(d.high);
    });

  var ebitaLine = areaGenerator(line);
  var area5 = areaGenerator(points5);
  var area10 = areaGenerator(points10);
  var area20 = areaGenerator(points20);
  var area80 = areaGenerator(points80);
  var area90 = areaGenerator(points90);
  var area95 = areaGenerator(points95);

  var pathTop = lineGenerator(pointsTop);
  var pathBottom = lineGenerator(pointsBottom);


  // Create a path element and set its d attribute
  svg.append('path')
    .attr('d', area5)
    .attr("fill", "#003a3c");
  svg.append('path')
    .attr('d', area10)
    .attr("fill", "#236974");
  svg.append('path')
    .attr('d', area20)
    .attr("fill", "#56a19b");
  svg.append('path')
    .attr('d', area80)
    .attr("fill", "#236974");
  svg.append('path')
    .attr('d', area90)
    .attr("fill", "#003a3c");
  svg.append('path')
    .attr('d', ebitaLine)
    .attr("fill", "black");

}

