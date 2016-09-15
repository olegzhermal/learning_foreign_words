//Row select setting
var selectRowProp = {
  mode: "checkbox",  //checkbox for multi select, radio for single select.
  clickToSelect: true,   //click row will trigger a selection on that row.
  bgColor: "rgb(238, 193, 213)"   //selected row background color
};

var cellEditProp = {
  mode: "click",
  blurToSave: true,
  afterSaveCell: function(row, cellName, cellValue){
      $.post('/updateData', row, function (result){
      });
  }
};

function onAfterTableComplete(){
  console.log('Table render complete.');
}

function onAfterInsertRow(row){
  console.log("Row inserted:");
  console.log(row);
  $.post('/saveData', row, function (result){
      console.log(result);
  });
}

function onAfterDeleteRow(rowKeys){
  console.log("onAfterDeleteRow");
  $.post('/deleteData', {keys:rowKeys}, function (result){
      console.log(result);
  });
}

var options = {
  afterTableComplete: onAfterTableComplete, // A hook for after table render complete.
  afterDeleteRow: onAfterDeleteRow,  // A hook for after droping rows.
  afterInsertRow: onAfterInsertRow   // A hook for after insert rows
};

var StartLearningButton = React.createClass({
  getInitialState: function () {
    return { count: 0 };
  },
    handleClick: function () {
        $('html, body').animate({
            scrollTop: $("#screen2").offset().top
        }, 500);
    },
  render: function () {
    return (
      <button type="button" className="btn btn-primary btn-block" onClick={this.handleClick}>
          Hit Enter or click to start checking your knowledge!
      </button>
    );
  }
});

var WordsTable = React.createClass({
    getInitialState: function() {
        var initial = [];
        return {'initial':initial};
    },
    componentDidMount: function() {
        this.serverRequest = $.get('/getInitialState', function (result){
            this.setState({
                initial: result
            });
            }.bind(this));
        },
    render: function() {
        return (
            <div className='SPA'>
                <BootstrapTable
                        data={this.state.initial}
                        striped={true}
                        hover={true}
                        pagination={true}
                        selectRow={selectRowProp}
                        cellEdit={cellEditProp}
                        insertRow={true}
                        deleteRow={true}
                        search={true}
                        columnFilter={true}
                        options={options}>

                    <TableHeaderColumn dataField="word" width="200px" dataAlign="center" dataSort={true} isKey={true}>A word</TableHeaderColumn>
                    <TableHeaderColumn dataField="description" dataSort={true}>Description</TableHeaderColumn>
                    <TableHeaderColumn dataField="date" width="250px" dataAlign="center" dataSort={true}>Date to repete ( DD-MM-YYYY)</TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
})

var LearnignView = React.createClass({
    getInitialState: function() {
        var initial = [];
        return {word:'There is now words to repeat today!', description:'check out tomorrow', counter:0};
    },
    componentDidMount: function() {
        this.serverRequest = $.post('/getWordToRepeat', this.state, function (wordForNow){
                this.setState(wordForNow);
        }.bind(this));
        this.serverRequest = $.post('/getCounterMax', this.state, function (coumterMax){
            this.setState(coumterMax);
        }.bind(this));
    },
    showPrevious: function(){
        if (this.state.counter - 1 >= 0) (this.state.counter = this.state.counter - 1 );
        this.serverRequest = $.post('/getWordToRepeat', this.state, function (wordForNow){
                this.setState(wordForNow);
        }.bind(this));
    },
    showNext: function(){
        if (this.state.counter + 1 < this.state.counterMax) (this.state.counter = this.state.counter + 1 );
        this.serverRequest = $.post('/getWordToRepeat', this.state, function (wordForNow){
                this.setState(wordForNow);
        }.bind(this));
    },
    repeatTomorrow: function(){
        this.serverRequest = $.post('/repeatTomorrow', {word:this.state.word}, function (result){
            console.log(result);
        }.bind(this));
    },
    repeatLater: function(){
        this.serverRequest = $.post('/repeatLater', {word:this.state.word}, function (result){
            console.log(result);
        }.bind(this));
    },
    render: function(){
        console.log(this.state);
        return(
            <div id="LearnignView">
                <h1>{this.state.word}</h1>
                <div>{this.state.description}</div>
                <div id='control'>
                    <button type="button" onClick={this.showPrevious}>
                        Previous
                    </button>
                    <button type="button" onClick={this.showNext}>
                        Next
                    </button>
                    <button type="button" onClick={this.repeatTomorrow}>
                        Repeat tomorrow
                    </button>
                    <button type="button" onClick={this.repeatLater}>
                        Put away for a while
                    </button>
                </div>
            </div>
        )
    }
})

var Spa = React.createClass({
    render: function(){
        return (
            <div className='SPA'>
                <div id="screen1">
                    <WordsTable />
                    <StartLearningButton />
                </div>
                <div id="screen2">
                    <LearnignView />
                </div>
            </div>
        );
    }
})

ReactDOM.render(
    <Spa />,
    document.getElementById("content")
);
