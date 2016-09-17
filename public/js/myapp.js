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
          console.log(result);
      });
  }
};

function onAfterTableComplete(){
  // console.log('Table render complete.');
}

function onAfterInsertRow(row){
  console.log("Word inserted: "+row.word);
  $.post('/saveData', row, function (result){
      console.log(result);
  });
}

function onAfterDeleteRow(rowKeys){
  $.post('/deleteData', {keys:rowKeys}, function (result){
      console.log(result);
      console.log(rowKeys);
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
          Hit keyboard "S" button or click here to START checking your vocabulary!
      </button>
    );
  }
});

var definitionEdit = {
    type: 'textarea',
    validator: function(val){
        if (val.length > 1000){
            console.log('Error: To long for a word definition. Try to make it 1000 symbols or less');
            return false;
        } else if (!/\S/.test(val)) {
            console.log('Error: I don\'t see any definition! Type it!');
            return false;
        } else {
            return true;
        }
    }
}

var dateEdit = {
    validator: function(val){
        if (moment(val, 'DD-MM-YYYY').toDate() == 'Invalid Date' || val.length != 10){
            console.log('Error: Date should be formated as DD-MM-YYYY');
            return false;
        } else if (moment(val, 'DD-MM-YYYY').toDate() < moment().subtract(1, 'days')) {
            console.log('Error: Date should not be older than today');
            return false;
        } else if (moment(val, 'DD-MM-YYYY').toDate() > moment().add(100, 'years')) {
            console.log('Error: Do you want to live 100+ years?! This app won\'t =)');
            return false;
        } else {
            return true;
        };
    },
}

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
                    <TableHeaderColumn dataField="description" dataSort={true} editable={definitionEdit}>Definition</TableHeaderColumn>
                    <TableHeaderColumn dataField="date" width="220px" dataAlign="center" dataSort={true} editable={dateEdit}>
                        Repeat at (DD-MM-YYY)
                    </TableHeaderColumn>
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
        $('#definition').addClass('hidden');
        if (this.state.counter - 1 >= 0) (this.state.counter = this.state.counter - 1 );
        this.serverRequest = $.post('/getWordToRepeat', this.state, function (wordForNow){
                this.setState(wordForNow);
        }.bind(this));
    },
    showNext: function(){
        $('#definition').addClass('hidden');
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
    showDefinition: function(){
        $('#definition').toggleClass('hidden');
    },
    render: function(){
        return(
            <div id="LearnignView">
                <div id='control'>
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button" className="btn btn-primary" onClick={this.showPrevious}>
                            Previous (J)
                        </button>
                        <button type="button" className="btn btn-primary" onClick={this.showNext}>
                            Next (L)
                        </button>
                    </div>
                    <button type="button" className="btn btn-info" onClick={this.showDefinition}>
                        Show/hide definition (K)
                    </button>
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button" className="btn btn-success" onClick={this.repeatTomorrow}>
                            Repeat tomorrow (U)
                        </button>
                        <button type="button" className="btn btn-warning" onClick={this.repeatLater}>
                            Done! Repeat later (M)
                        </button>
                    </div>
                </div>
                <div id='wordAndDefinition'>
                    <h1 id="wordToRepeat">{this.state.word}</h1>
                    <div id='definition' className='hidden'>{this.state.description}</div>
                </div>
            </div>
        )
    }
})

var Spa = React.createClass({
    componentDidMount: function() {
        var self = this;
        Mousetrap.bind('l', function() {
            self.refs['LearnignView'].showNext();
        });
        Mousetrap.bind('j', function() {
            self.refs['LearnignView'].showPrevious();
        });
        Mousetrap.bind('m', function() {
            self.refs['LearnignView'].repeatLater();
        });
        Mousetrap.bind('u', function() {
            self.refs['LearnignView'].repeatTomorrow();
        });
        Mousetrap.bind('k', function() {
            self.refs['LearnignView'].showDefinition();
        });
    },

    render: function(){
        return (
            <div className='SPA'>
                <div id="screen1">
                    <WordsTable />
                    <StartLearningButton />
                </div>
                <div id="screen2">
                    <LearnignView ref='LearnignView'/>
                </div>
            </div>
        );
    }
})

ReactDOM.render(
    <Spa />,
    document.getElementById("content")
);
