function Final() {
    var filePath = "valo_stats.csv";
    question0(filePath);
    question1(filePath);
    question2(filePath);
    question3(filePath);
    question4(filePath);
}

var question0 = function (filePath) {
    d3.csv(filePath).then(function (data) {
        // set the dimensions and margins of the graph
        var margin = {
                top: 40,
                right: 30,
                bottom: 90,
                left: 60
            },
            width = 660 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#q0_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.

        var NA_teams = ['Sentinels', "Version1", "100 Thieves", "OpTic Gaming", "Cloud9", "The Guard"]
        var filtered = data.filter(function (d) {
            if (NA_teams.includes(d.Team)) {
                return d
            }
        })
        var max = d3.max(d3.map(filtered, d => parseInt(d.K)))

        var group = d3.group(filtered, d => d.Team)


        var final = d3.map(group, function (d) {
            var tempo = d3.map(d[1], d => parseInt(d.K))
            var q1 = d3.quantile(tempo, .25)
            var median = d3.quantile(tempo, .5)
            var q3 = d3.quantile(tempo, .75)
            var iqr = q3 - q1
            return {
                key: d[0],
                q1: q1,
                median: median,
                q3: q3,
                iqr: iqr,
                min: d3.min(tempo),
                max: d3.max(tempo)
            }
        })



        //AXES LABELS
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("font-size", 20)
            .attr("x", width)
            .attr("y", height + margin.bottom / 1.2)
            .text("Team");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", -margin.left)
            .attr("font-size", 20)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Number of Kills");

        // Show the X scale
        var x = d3.scaleBand()
            .range([0, width])
            .domain(NA_teams)
            .paddingInner(1)
            .paddingOuter(.5)
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Show the Y scale
        var y = d3.scaleLinear()
            .domain([0, max])
            .range([height, 0])
        svg.append("g").call(d3.axisLeft(y))

        // Show the main vertical line
        svg
            .selectAll("vertLines")
            .data(final)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (x(d.key))
            })
            .attr("x2", function (d) {
                return (x(d.key))
            })
            .attr("y1", function (d) {
                return (y(d.min))
            })
            .attr("y2", function (d) {
                return (y(d.max))
            })
            .attr("stroke", "black")
            .style("width", 40)

        // rectangle for the main box
        var boxWidth = 35
        svg
            .selectAll("boxes")
            .data(final)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return (x(d.key) - boxWidth / 2)
            })
            .attr("y", function (d) {
                return (y(d.q3))
            })
            .attr("height", function (d) {
                return (y(d.q1) - y(d.q3))
            })
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#ff4654")

        // Show the median
        svg
            .selectAll("medianLines")
            .data(final)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (x(d.key) - boxWidth / 2)
            })
            .attr("x2", function (d) {
                return (x(d.key) + boxWidth / 2)
            })
            .attr("y1", function (d) {
                return (y(d.median))
            })
            .attr("y2", function (d) {
                return (y(d.median))
            })
            .attr("stroke", "black")
            .style("width", 80)
    })
}

var question1 = function (filePath) {
    var svgwidth = 600
    var svgheight = 400
    var padding = 50

    let svg = d3.select("#q1_plot").append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight)

    d3.csv(filePath).then(function (data) {

        let okay = d3.rollup(data, d => d3.sum(d, v => parseInt(v.ACSPerMap)), d => d.Country)
        let okay2 = {}
        let okay3 = []
        let values = Array.from(d3.map(okay, function (d) {
            if (d[0] == "United States") {
                okay2["USA"] = d[1]
            } else if (d[0] == "Czechia") {
                okay2["Czech Republic"] = d[1]
            } else if (d[0] == "United Kingdom") {
                okay2["England"] = d[1]
            } else {
                okay2[d[0]] = d[1]
            }
            okay3.push(d[1])
        }))
        okay3.sort(function (a, b) {
            return a - b;
        });

        var color_domain = [0, 100, 500, 1000, 2000, 3000, 4000, 5000]
        var color_range = ['#ffdadd','#ffedee','#ffc8cc','#ff7e87','#ff4654','#cc3843','#80232a','#330e11', '#000000']

        var color = d3.scaleThreshold()
            .domain(color_domain)
            .range(color_range);

        console.log(color(3000) + " " + color(2000))


        var legend_labels = ["< 100", "100", "500", "1000", '2000','3000', '4000', '5000+'];
        var ls_w = 30,
            ls_h = 30;

        var legend = svg.selectAll("g.legend")
            .data(color_domain)
            .enter().append("g")
            .attr("class", "legend")
            .attr('transform', function (d, i) {
                return 'translate(0 ' + ', ' + (svgheight - (i * ls_h) - ls_h) + ' )'
            });

        legend.append("rect")
            .attr("x", -15)
            .attr("y", -100)
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) {
                return color(d);
            })
            .style("opacity", 0.8);

        legend.append("text")
            .attr("x", 25)
            .attr("y", -80)
            .text(function (d, i) {
                return legend_labels[i];
            });

        svg.append("text")
            .attr("class", "legendTitle")
            .attr("text-anchor", "middle")
            .attr('transform', 'translate(' + ((svgwidth /2) - 35) + ',30)')
            .attr('font-size', 20)
            .text("Which Country has the Highest Average Combat Score ");

        var projection2 = d3
            .geoNaturalEarth1()
            .scale(100)
            .translate([svgwidth / 2, svgheight / 2]); //chain translate and scale
        var pathgeo2 = d3.geoPath().projection(projection2);

        //TO DO: Load JSON file and create the map
        d3.json("world.json").then(
            (data1) => {
                svg
                    .selectAll("path")
                    .data(data1.features)
                    .enter()
                    .append("path")
                    .attr("d", pathgeo2)
                    .attr("fill", function (d) {
                        if (okay2[d.properties.name] == undefined) {
                            return color(0)
                        } else {
                            return color(okay2[d.properties.name])
                        }
                    });
            });


    });

}

var question2 = function (filePath) {


    d3.csv(filePath).then(function (data) {

        //data cleaning
        var kills = d3.map(data, d => parseInt(d.K))
        var ACS = d3.map(data, d => parseInt(d.ACSPerMap))
        var maxK = d3.max(kills)
        var maxACS = d3.max(ACS)
        var minK = d3.min(kills)
        var minACS = d3.min(ACS)

        // A function that updates the chart when the user zoom and thus new boundaries are available
        function updateChart(event) {

            var transform = event.transform
            // recover the new scale
            var newX = transform.rescaleX(x);
            var newY = transform.rescaleY(y);

            // update axes with these new boundaries
            xAxis.call(d3.axisBottom(newX)).transition()
            yAxis.call(d3.axisLeft(newY))

            // update circle position
            scatter
                .selectAll("circle")
                .attr('cx', function (d) {
                    return newX(d.K)
                })
                .attr('cy', function (d) {
                    return newY(d.ACSPerMap)
                });
        }

        // set the dimensions and margins of the graph
        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the SVG object to the body of the page
        var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")


        // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
        var zoom = d3.zoom()
            .scaleExtent([.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", updateChart);

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "transparent")
            .style("pointer-events", "all")
            //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .lower();

        svg.call(zoom)
        // now the user can zoom and it will trigger the function called updateChart

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, maxK * 1.2])
            .range([0, width])
            .nice()
        var xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));


        //AXES LABELS
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 6)
            .text("Total Number of Kills");


        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Average Combat Score");


        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxACS * 1.5])
            .range([height, 0])
            .nice()
        var yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = svg.append('g')
            .attr("clip-path", "url(#clip)")


        // create a tooltip
        var tooltip = d3.select("#scatter")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (event, d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
                .style("fill", "black")
        }
        var mousemove = function (event, d) {
            tooltip
                .html("Player:  " + d.Player + "<br>Team: " + d.Team + "<br>Kills: " + d.K + "<br>ACS: " + d.ACSPerMap)
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
        }
        var mouseleave = function (d) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.5)
                .style('fill', '#ff4654')
        }
        // Add circles
        scatter
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.K);
            })
            .attr("cy", function (d) {
                return y(d.ACSPerMap);
            })
            .attr("r", 6)
            .style("fill", "#ff4654")
            .style("opacity", 0.7)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


    })
}

var question3 = function (filePath) {
    // set the dimensions and margins of the graph
    var margin = {
            top: 10,
            right: 30,
            bottom: 90,
            left: 60
        },
        width = 660 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv(filePath).then(function (data) {

        var data_japan = data.filter(function (d) {
            if (d.Country == "Japan") {
                return d
            }
        })

        var countries = Array.from(new Set(d3.map(data, d => d.Country)))
        var players = d3.map(data_japan, function (d) {
            return d.Player;
        })

        var maxACS = d3.max(d3.map(data, d => parseInt(d.ACSPerMap)))
        // X axis
        var x = d3.scaleBand()
            .range([0, width])
            .domain(players)
            .padding(0.2);


        var xAxis = svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxACS])
            .range([height, 0]);
        svg.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));


        //AXES LABELS
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -margin.bottom * 1.2)
            .attr("y", -margin.left)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Average Combat Score")
            .attr('font-size', 25);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr('font-size', 25)
            .attr("x", width - margin.left * 4)
            .attr("y", height + margin.bottom / 1.3)
            .text("Player");

        // Bars
        var bar = svg.selectAll("mybar")
            .data(data_japan)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.Player);
            })
            .attr("width", x.bandwidth())
            .attr("fill", "#ff4654")
            // no bar at the beginning thus:
            .attr("height", function (d) {
                return height - y(0);
            }) // always equal to 0
            .attr("y", function (d) {
                return y(0);
            })

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function (d) {
                return y(d.ACSPerMap);
            })
            .attr("height", function (d) {
                return height - y(d.ACSPerMap);
            })
            .delay(function (d, i) {
                return (i * 100)
            })

        // Initialize the button
        var dropdownButton = d3.select("#dropdown")
            .append('select')

        // add the options to the button
        dropdownButton // Add a button
            .selectAll('myOptions')
            .data(countries)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            })
            .attr("value", function (d) {
                return d;
            })

        function updateChart(selectedOption) {

            var new_data = data.filter(function (d) {
                if (d.Country == selectedOption) {
                    return d
                }
            })
            var player_data = d3.map(new_data, d => d.Player)
            // recover the new scale
            x.domain(player_data).padding(0.2)
            svg.select(".xaxis").transition().call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")

            // Give these new data to update line
            var bar1 = svg.selectAll("mybar")
                .data(new_data);

            bar1.exit().remove();
            svg.selectAll("rect").remove()


            bar1.enter().append("rect")
                .merge(bar1)
                .attr("x", function (d) {
                    return x(d.Player);
                })
                .attr("width", x.bandwidth())
                .attr("fill", "#ff4654")
                // no bar at the beginning thus:
                .attr("height", function (d) {
                    return height - y(0);
                }) // always equal to 0
                .attr("y", function (d) {
                    return y(0);
                })

                //svg.selectAll("rect")
                .transition()
                .duration(800)
                .attr("y", function (d) {
                    return y(d.ACSPerMap);
                })
                .attr("height", function (d) {
                    return height - y(d.ACSPerMap);
                })
                .delay(function (d, i) {
                    return (i * 100)
                })
        }
        // When the button is changed, run the updateChart function
        dropdownButton.on("change", function (d) {
            var selectedOption = d3.select(this).property("value")
            updateChart(selectedOption)
        })


    })
}

var question4 = function (filePath) {
    // set the dimensions and margins of the graph

    d3.csv(filePath).then(function (data) {
        var margin = {
                top: 10,
                right: 60,
                bottom: 90,
                left: 70
            },
            width = 660 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#q4_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Parse the Data
        // List of subgroups = header of the csv files = soil condition here
        //var subgroups = data.columns.slice(1)
        var sen_data = data.filter(function (d) {
            if (d.Team == "Crazy Raccoon") {
                return d
            }
        })
        var sen_players = d3.map(sen_data, d => d.Player)
        var teams = Array.from(new Set(d3.map(data, d => d.Team)))
        var max = []
        d3.map(data, function (d) {
            max.push(parseInt(d.D) + parseInt(d.K) + parseInt(d.A))
        })
        var max_real = d3.max(max)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var keys = ['kills', 'deaths', 'assists']
        var filtered = []
        d3.map(sen_data, function (d) {
            filtered.push({
                player: d.Player,
                kills: d.K,
                deaths: d.D,
                assists: d.A
            })
        })

        // Add X axis
        var x = d3.scaleBand()
            .domain(sen_players)
            .range([0, width])
            .padding([0.1])
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, max_real])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(['#ff4654', '#000000', '#469eff'])

        //stack the data? --> stack per subgroup

        var generator = d3.stack().keys(keys);
        var series = generator(filtered);

        //AXES LABELS
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("font-size", 25)
            .attr("x", width - margin.left * 3.7)
            .attr("y", height + margin.bottom / 1.4)
            .text("Player");


        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", -margin.left * 3)
            .attr("font-size", 25)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total");

        // Show the bars
        svg.append("g")
            .selectAll("bars")
            // Enter in the stack data = loop key per key = group per group
            .data(series)
            .enter().append("g")
            .attr("fill", function (d) {
                return color(d.key);
            })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return x(d.data.player);
            })
            .attr("y", function (d) {
                return y(d[1]);
            })
            .attr("height", function (d) {
                return y(d[0]) - y(d[1]);
            })
            .attr("width", x.bandwidth())


        // Initialize the button
        var dropdownButton = d3.select("#drop")
            .append('select')

        // add the options to the button
        dropdownButton // Add a button
            .selectAll('myOptions')
            .data(teams)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            })
            .attr("value", function (d) {
                return d;
            })




        //legend
        svg.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
            .attr("cx", width + 5)
            .attr("cy", function (d, i) {
                return 100 + i * 25
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function (d) {
                return color(d)
            })

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", width + 15)
            .attr("y", function (d, i) {
                return 100 + i * 25
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) {
                return color(d)
            })
            .text(function (d) {
                return d
            })
            .attr("text-anchor", "left")
            .attr("font-size", 14)
            .style("alignment-baseline", "middle")

        function updateChart(selectedOption) {

            var new_data = data.filter(function (d) {
                if (d.Team == selectedOption) {
                    return d
                }
            })
            var new_players = d3.map(new_data, d => d.Player)

            var filtered2 = []
            d3.map(new_data, function (d) {
                filtered2.push({
                    player: d.Player,
                    kills: d.K,
                    deaths: d.D,
                    assists: d.A
                })
            })
            var generator2 = d3.stack().keys(keys);
            var series2 = generator(filtered2);


            // recover the new scale
            x.domain(new_players)
            svg.select(".xaxis").transition().call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end")

            // Give these new data to update line
            var bars = svg.selectAll("bars")
                .data(new_data);

            bars.exit().remove();
            svg.selectAll("rect").remove()

            // Show the bars
            svg.append("g")
                .selectAll("bars")
                // Enter in the stack data = loop key per key = group per group
                .data(series2)
                .enter().append("g")
                .attr("fill", function (d) {
                    return color(d.key);
                })
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(function (d) {
                    return d;
                })
                .enter().append("rect")
                .attr("x", function (d) {
                    return x(d.data.player);
                })
                .attr("y", function (d) {
                    return y(d[1]);
                })
                .attr("height", function (d) {
                    return y(d[0]) - y(d[1]);
                })
                .attr("width", x.bandwidth())
        }
        // When the button is changed, run the updateChart function
        dropdownButton.on("change", function (d) {
            var selectedOption = d3.select(this).property("value")
            updateChart(selectedOption)
        })


    })

}