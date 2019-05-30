
/*Setup everything that doesn't require data first*/
// svg container
const height = 600;
const width = 1000;
let chosenXAxis = 'healthcare'

// margins
const margin = {
  top: 10,
  right: 10,
  bottom: 150,
  left:150
};

// chart area minus margins
const chartHeight = height - margin.top - margin.bottom;
const chartWidth = width - margin.left - margin.right;

// Create a color map for challenge
// In a production application typically is generated using a color scale
// const color_map = {'setosa': 'green', 'virginica':'red', 'versicolor':'black'}
const color_map = {'color1': 'green', 'color2':'red', 'color3':'black'}

// create svg container
const svg = d3.select('#chart').append('svg')
      .attr('height', height)
      .attr('width', width)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('id', 'bar_chart');


// shift everything over by the margins
const labelsGroup = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${chartHeight+20})`);

labelsGroup.append('text')
    .attr('x', 0)
    .attr('y', 10)
    .attr('value', 'poverty') // value to grab for event listener
    .text('Poverty');

// Add Y axis label
svg.append('g')
      .attr('transform', `translate(-25, ${chartHeight / 2}) rotate(-90)`)
    .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('Healthcare');

// Define update functions that will be called when user selection is made
function xScale_update(sales_data, chosenXAxis){
  /* Generate yScale based on selected value */

  const xLinearScale = d3.scaleLinear()
        .domain([0, d3.max(sales_data, d => d[chosenXAxis])])
        .range([0, chartWidth]);

  return xLinearScale
  }

function renderAxes(newXScale, xAxis_g) {
  /*Update xAxis with new scale value */

  const bottomAxis = d3.axisBottom(newXScale);

  xAxis_g.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis_g;
}


function UpdateBars(circleGroup, newXScale) {
  /* function used for updating circles group by clicking on event listener */
  circleGroup
    .transition()
    .duration(1000)
    .attr('cx', d =>newXScale(d[chosenXAxis]));

  return;
}


d3.csv('/assets/data/data.csv')
    .then(function(data){
        console.log(data)


        // Set Scales
        const yScale = d3.scaleLinear()
            .domain([0, 25])
            .range([chartHeight, 0]);

        const xScale = d3.scaleLinear()
            .domain([0, 30])
            .range([0, chartWidth])

        // Create axes for Svg
        const yAxis_func = d3.axisLeft(yScale);
        const xAxis_func = d3.axisBottom(xScale);

        // set x to the bottom of the chart
        let xAxis_g = svg.append('g')
            .attr('id', 'xaxis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis_func);

        // Assign YAxis to variable so we can update it later
        svg.append('g')
            .attr('id', 'yaxis')
            .call(yAxis_func);

        // Create the circles using data binding
        const circleGroup = svg.selectAll('circle')
            .data(data)
                .enter()
            .append('circle')
            .attr('cx', d => xScale(d['healthcare']))
            .attr('cy', d => yScale(d['poverty']))
            .attr('fill', 'green')
            .attr('r', 13);
            

         const textGroup = svg.selectAll('text')
         .data(data)
             .enter()
         .append('text')
         .attr('x', d => xScale(d['healthcare']))
         .attr('y', d => yScale(d['poverty']))
         .attr('fill', 'black')
         .attr('font-size','10px')
         .attr('text-anchor','middle')
         .text(d => d['abbr']);

        labelsGroup.selectAll('text')
            .on('click', function() {

              // get value of selection
              const value = d3.select(this).attr('value');
              console.log(value);
              if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;


                // functions here found above csv import
                // updates x scale for new data
                const xLinearScale = xScale_update(data, chosenXAxis);

                // updates x axis with transition
                xAxis_g = renderAxes(xLinearScale, xAxis_g);

                // updates circles with new x values
                UpdateBars(circleGroup, xLinearScale);
                UpdateBars(textGroup, xLinearScale);

                }
        })
    })
