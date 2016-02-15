// set the stage
var margin = {t:30, r:20, b:20, l:40 },
    w = 600 - margin.l - margin.r,
    h = 500 - margin.t - margin.b,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([h - 60, 0]);

var svg = d3.select("#chart").append("svg")
    .attr("width", w + margin.l + margin.r)
    .attr("height", h + margin.t + margin.b);

// set axes, as well as details on their ticks
var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(10)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(10)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("left");

// array of outcome types
var outcomes = ["gain", "loss", "break-even"];
var outcomeColors = {"gain": "#009900", "loss": "#ff0000", "break-even": "#0000ff"};

// Initialize empty scatter plot
drawScatterPlot([]);

function drawScatterPlot(betData) {
    // Clear data from earlier plots
    svg.selectAll("*").remove();

    // group that will contain all of the plots
    var groups = svg.append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");

    // Get all possible outcomes based on bets
    var data = generateOutcomePlotItems(betData);

    // Set plot range
    if (data.length === 0) {
        x.domain([-100, 100]);
    } else {
        var xPad = 0.1 * Math.max(
            -d3.min(data, function(d) { return d.profit; }),
            d3.max(data, function(d) { return d.profit; })
        );
        var x0 = d3.min(data, function(d) { return d.profit; }) - xPad;
        var x1 = d3.max(data, function(d) { return d.profit; }) + xPad;
        x.domain([x0, x1]);
    }
    y.domain([0, 100]);

    // style the circles, set their locations based on data
    var circles = groups.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "circles")
        .attr({
            cx: function(d) { return x(d.profit); },
            cy: function(d) { return y(d.probability); },
            r: 8,
            id: function(d) { return d.outcome; }
        })
        .style("fill", function(d) { return outcomeColors[d.outcome]; });

    // what to do when we mouse over a bubble
    var mouseOn = function() {
        var circle = d3.select(this);

        // transition to increase size/opacity of bubble
        circle.transition()
            .duration(800).style("opacity", 1)
            .attr("r", 12).ease("elastic");

        // append lines to bubbles that will be used to show the precise data points.
        // translate their location based on margins
        svg.append("g")
            .attr("class", "guide")
            .append("line")
            .attr("x1", circle.attr("cx"))
            .attr("x2", circle.attr("cx"))
            .attr("y1", +circle.attr("cy") + 26)
            .attr("y2", h - margin.t - margin.b)
            .attr("transform", "translate(40,20)")
            .style("stroke", circle.style("fill"))
            .transition().delay(200).duration(400).styleTween("opacity",
                        function() { return d3.interpolate(0, 0.5); });

        svg.append("g")
            .attr("class", "guide")
            .append("line")
            .attr("x1", +circle.attr("cx") - 16)
            .attr("x2", 0)
            .attr("y1", circle.attr("cy"))
            .attr("y2", circle.attr("cy"))
            .attr("transform", "translate(40,30)")
            .style("stroke", circle.style("fill"))
            .transition().delay(200).duration(400).styleTween("opacity",
                        function() { return d3.interpolate(0, 0.5); });

        // function to move mouseover item to front of SVG stage, in case
        // another bubble overlaps it
        d3.selection.prototype.moveToFront = function() {
            return this.each(function() {
                this.parentNode.appendChild(this);
            });
        };

        // skip this functionality for IE9, which doesn't like it
        if (!$.browser.msie) {
            circle.moveToFront();
        }
    };

    // what happens when we leave a bubble?
    var mouseOff = function() {
        var circle = d3.select(this);

        // go back to original size and opacity
        circle.transition()
            .duration(800).style("opacity", 0.5)
            .attr("r", 8).ease("elastic");

        // fade out guide lines, then remove them
        d3.selectAll(".guide").transition().duration(100)
            .styleTween(
                "opacity",
                function() {
                    return d3.interpolate(0.5, 0);
                }
            )
            .remove();

    };

    // run the mouseon/out functions
    circles.on("mouseover", mouseOn);
    circles.on("mouseout", mouseOff);

    // tooltips (using jQuery plugin tipsy)
    circles.append("title")
        .text(function(d) { return d.outcome; });

    $(".circles").tipsy({ gravity: 's', });

    // the legend color guide
    var legend = svg.selectAll("rect")
        .data(outcomes)
        .enter().append("rect")
        .attr({
            x: function(d, i) { return (40 + i*80); },
            y: h,
            width: 25,
            height: 12
        })
        .style("fill", function(d) {
            return outcomeColors[d]; }
        );


    // legend labels
    svg.selectAll("text")
        .data(outcomes)
        .enter().append("text")
        .attr({
            x: function(d, i) { return (40 + i*80); },
            y: h + 24
        })
        .text(function(d) { return d; });

    // draw axes and axis labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")")
        .call(yAxis);

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", w + 50)
        .attr("y", h - margin.t - 5)
        .text("profit ($)");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -20)
        .attr("y", 45)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("probability (%)");

}

function generateOutcomePlotItems(betData) {
    var outcomeItems = [];
    function buildOutcomes(outcomesSoFar, betsRemaining) {
        if (betsRemaining.length === 0) {
            outcomeItems.push(outcomesSoFar);
        } else {
            // Setup win loss outcomes for next bet
            var nextBet = betsRemaining[0];
            var nextBetWin = {"profit": nextBet.profit, "probability": nextBet.probability};
            var nextBetLoss = {"profit": -nextBet.wager, "probability": 1.0 - nextBet.probability};

            // Evaluate outcomes for following bets
            buildOutcomes(outcomesSoFar.concat(nextBetWin), betsRemaining.slice(1));
            buildOutcomes(outcomesSoFar.concat(nextBetLoss), betsRemaining.slice(1));
        }
    }

    if (betData.length === 0) {
        return [];
    } else {
        // Pull out fields of betData
        var wagers = betData.map(function(x) { return parseFloat(x.wager); });
        var profits = betData.map(function(x) { return parseFloat(x.profit); });
        // Calculate relevant sums
        var totalWager = wagers.reduce(function(prev, curr) { return prev + curr; }).toFixed(2);
        var maxProfit = profits.reduce(function(prev, curr) { return prev + curr; }).toFixed(2);

        // Combine bets that belong to the same fight since they are jointly dependent on eachother
        // ADD CODE

        // Generate list of all potential fight outcomes
        buildOutcomes([], betData);

        // Transalte outcome arrays into summary data to be plotted
        var plotItems = outcomeItems.map(function(outcome) {
            var profit = outcome.reduce(function(prev, curr) { return prev + curr.profit; }, 0);
            var probability = outcome.reduce(function(prev, curr) { return prev * curr.probability; }, 100.0);
            var outcomeStr;
            if (profit > 0) outcomeStr = "gain"; else if (profit < 0) outcomeStr = "loss"; else outcomeStr = "break-even";
            return {"profit": profit, "probability": probability.toFixed(2), "outcome": outcomeStr};
        });

        // Update portfolio summary table
        var expectedProfit = plotItems.reduce(
            function(prev, curr) {
                return prev + (curr.profit * curr.probability / 100.0);
            }, 0).toFixed(2);
        var maxReturn = (maxProfit / totalWager * 100.0).toFixed(2);
        var expectedReturn = (expectedProfit / totalWager * 100.0).toFixed(2);
        $(".summary_table").find(".total_bet").html("$" + totalWager);
        $(".summary_table").find(".max_profit").html("$" + maxProfit);
        $(".summary_table").find(".expected_profit").html("$" + expectedProfit);
        $(".summary_table").find(".max_return").html(maxReturn + "%");
        $(".summary_table").find(".expected_return").html(expectedReturn + "%");

        return plotItems;
    }
}
