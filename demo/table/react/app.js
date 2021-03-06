// import {html,defineWebComponent as defineComponent,WebComponent as Component,render,property} from 'illidan';
import React,{Component} from 'react';
import ReactDOM from 'react-dom';
// function property(){}

import getData from '../getData'

// var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
//   var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
//   if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
//   else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
//   return c > 3 && r && Object.defineProperty(target, key, r), r;
// };


const Columns = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i'
]

function generateTableData(rows){
    let result = [];
    for(let i = 0; i < rows; i++){
        const row = [];
        for(let j = 0; j < Columns.length; j++){
            row.push(Math.floor(Math.random() * 10000))
        }
        result.push(row)
    }
    return result;
}


class Query extends Component{
    lpad(padding, toLength, str) {
      return padding.repeat((toLength - str.length) / padding.length).concat(str);
    };
  
    formatElapsed(value) {
      var str = parseFloat(value).toFixed(2);
      if (value > 60) {
          minutes = Math.floor(value / 60);
          comps = (value % 60).toFixed(2).split('.');
          seconds = this.lpad('0', 2, comps[0]);
          ms = comps[1];
          str = minutes + ":" + seconds + "." + ms;
      }
      return str;
    };
    
    render() {
      var className = "elapsed short";
      if (this.props.elapsed >= 10.0) {
          className = "elapsed warn_long";
      } else if (this.props.elapsed >= 1.0) {
          className = "elapsed warn";
      }
  
      return <td className={`Query ${className}`}>
          {this.props.elapsed ? this.formatElapsed(this.props.elapsed) : '-'}
          <div className="popover left">        
            <div className="popover-content">{this.props.query}</div>
            <div className="arrow"/>
          </div>
        </td>
    };
}
// __decorate([
//   property()
// ], Query.prototype, "elapsed", void 0);
// __decorate([
//   property()
// ], Query.prototype, "query", void 0);
// __decorate([
//   property()
// ], Query.prototype, "key", void 0);
// defineComponent('my-query',Query)

class Database extends Component{
    sample(queries, time) {
      var topFiveQueries = queries.slice(0, 5);
      while (topFiveQueries.length < 5) {
        topFiveQueries.push({ query: "" });
      }

      var _queries = [];
      topFiveQueries.forEach(function(query, index) {
        _queries.push(<Query
            key={index}
            query={query.query}
            elapsed={query.elapsed}
          />);
      });

      var countClassName = "label";
      if (queries.length >= 20) {
        countClassName += " label-important";
      }
      else if (queries.length >= 10) {
        countClassName += " label-warning";
      }
      else {
        countClassName += " label-success";
      }

      return [<td className="query-count" key="-1">
          <span className={countClassName}>
            {queries.length}
          </span>
        </td>,
        ..._queries
        ];
    };

    render() {
        var lastSample = this.props.samples[this.props.samples.length - 1];

        return <tr key={this.props.dbname}>
            <td className="dbname">
              {this.props.dbname}
            </td>
            {this.sample(lastSample.queries, lastSample.time)}
        </tr>
    };
};

// __decorate([
//   property()
// ], Database.prototype, "key", void 0);
// __decorate([
//   property()
// ], Database.prototype, "dbname", void 0);
// __decorate([
//   property()
// ], Database.prototype, "samples", void 0);
// defineComponent('my-database',Database)






class Table extends Component{

    constructor(props) {
        super(props);
        this.state = {
            databases : {},
            runflag:true
        }
        // this.getNewState();
    }
    getNewState(){
      var newData = getData(this.props.rows || this.rows);
      Object.keys(newData.databases).forEach(function(dbname) {
        var sampleInfo = newData.databases[dbname];
        if (!this.state.databases[dbname]) {
            this.state.databases[dbname] = {
            name: dbname,
            samples: []
            }
        }

        var samples = this.state.databases[dbname].samples;
        samples.push({
            time: newData.start_at,
            queries: sampleInfo.queries
        });
        if (samples.length > 5) {
            samples.splice(0, samples.length - 5);
        }
      }.bind(this));
    }
    loadData(){
        this.getNewState();
        this.setState(this.state);
        this.loadId = setTimeout(()=>{
            this.loadData()
        })
    }
    componentDidMount(){
        // setTimeout(()=>{
          this.loadData();
        // },100)
    }
    toggle=()=>{
      const {runflag} = this.state;
      this.state.runflag = !runflag
      this.setState({
        runflag:!runflag
      })
      if(runflag){
        clearTimeout(this.loadId)
      }else{
        this.loadData();
      }
    }
    render(){
        // const {color} = this.props;
        const {runflag} = this.state;
        var databases = [];
        Object.keys(this.state.databases).forEach(function(dbname) {
            databases.push(<Database key={dbname}
                dbname={dbname}
                samples={this.state.databases[dbname].samples} />
            );
        }.bind(this));
        return <div>
        <button type="primary" onClick={this.toggle}>{runflag ? '停止':'启动'}</button>
        <table className="table table-striped latest-data">
          <tbody>
            {databases}
          </tbody>
        </table>
      </div>
        // return html`<table class="table table-striped latest-data">
        //     <tr>
        //         ${Columns.map((name)=>{
        //             return html`<th>${name}</th>`
        //         })}
        //     </tr>
        //     ${data.map((item)=>{
        //         return html`<tr>
        //             ${item.map((val)=>{
        //                 return html`<td>${val}</td>`
        //             })}
        //         </tr>`
        //     })}
        // </table>`
    }
}
// __decorate([
//   property()
// ], Table.prototype, "rows", void 0);
// defineComponent('my-table',Table)

const rows = 100;

ReactDOM.render(<Table rows={rows}></Table>,document.getElementById('table'))

// render(html`<my-table rows=${rows}></my-table>`,document.getElementById('table'),{
//   components:{
//     'my-table':Table
//   }
// })