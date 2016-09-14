//Row select setting
var selectRowProp = {
  mode: "checkbox",  //checkbox for multi select, radio for single select.
  clickToSelect: true,   //click row will trigger a selection on that row.
  bgColor: "rgb(238, 193, 213)"   //selected row background color
};

var cellEditProp = {
  mode: "click",
  blurToSave: true
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
  console.log(rowKeys);
}

var options = {
  afterTableComplete: onAfterTableComplete, // A hook for after table render complete.
  afterDeleteRow: onAfterDeleteRow,  // A hook for after droping rows.
  afterInsertRow: onAfterInsertRow   // A hook for after insert rows
};

var WordsTable = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentDidMount: function() {
        this.serverRequest = $.get('/getInitialState', function (result){
            this.setState(result);
            }.bind(this));
        },
    render: function() {
        var dataArray = [];
        dataArray.push(this.state);
        return (
            <BootstrapTable
                    data={dataArray}
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
            </BootstrapTable>
        );
    }
})

ReactDOM.render(
    <WordsTable />,
    document.getElementById("wordsList")
);
