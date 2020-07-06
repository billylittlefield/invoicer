import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { viewport } from '@airtable/blocks';
import {
  initializeBlock,
  Button,
  useBase,
  useRecords,
  useGlobalConfig,
  Box,
  TextButton,
  expandRecord,
  Heading,
  Text,
  ViewPickerSynced,
  Select
} from '@airtable/blocks/ui';
import printInvoice, { HIDE_CLASS } from './print_invoice';
import Invoice from './Invoice';

const GlobalConfigKeys = {
  VIEW_ID: 'viewId'
};

const CLIENT_TABLE_NAME = 'Client';
const INVOICE_TABLE_NAME = 'Invoice';
const ITEMIZATION_TABLE_NAME = 'Itemization';
const TERMS_TABLE_NAME = 'Terms';
const CONFIG_TABLE_NAME = 'Config';
const REGION = 'en-US';
const CURRENCY = 'USD';

// Determines the minimum size the block needs before it asks the user to enlarge the block.
viewport.addMinSize({
  width: 600,
  height: 600
});

// Determines the maximum size of the block in fullscreen mode.
viewport.addMaxFullscreenSize({
  width: 900,
  height: 800
});

// TODO: Date sort options
const SORT_OPTIONS = [
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '0', label: 'All time' }
];

// Main block
function InvoicerBlock() {
  const base = useBase();
  const globalConfig = useGlobalConfig();

  viewport.enterFullscreenIfPossible();

  // Set table to pull Client information
  const table = base.getTableByName(CLIENT_TABLE_NAME);

  // globalConfig captures the VIEW_ID using ViewPickerSynced
  const viewId = globalConfig.get(GlobalConfigKeys.VIEW_ID);
  // Selects the view basedon the viewID
  const view = table.getViewByIdIfExists(viewId);

  const [currentClient, setCurrentClient] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [currentInvoiceItemization, setCurrentInvoiceItemization] = useState(
    null
  );
  const [currentTerms, setCurrentTerms] = useState(null);
  const [companyInformation, setCompanyInformation] = useState(null);
  const [defaultInvoice, setDefaultInvoice] = useState(null);

  // Sets the default values for invoice
  if (!defaultInvoice) {
    let date = moment().format('YYYY-MM-DD');

    // TODO: Get default status of "Under Development". Sadly, could not find clear reference on status insertion.
    let status = {
      id: 'selZuMLnUYgbdRfXr',
      name: 'Under Development',
      color: 'yellowLight1'
    };
    // TODO: Get default client (pull from table isDefault)
    let client = { id: 'recHzUuifYGX7noeq', name: 'Tracy Johnson' };

    // TODO: Get default term (pull from table isDefault)
    let terms = { id: 'recmUvp5hom1GKM97', name: 'Upon Receipt' };
    setDefaultInvoice({
      'Invoice Date': date,
      Status: status,
      Client: client,
      Terms: terms
    });
  }

  console.log('defaultInvoice', defaultInvoice);

  // Invoice reaction, core of showing printable invoice design
  useEffect(() => {
    // Prevent launch on first load
    if (currentInvoice) {
      printInvoice(currentInvoice, setCurrentInvoice(null)); // Close action for Print dialog, resets invoice to null
    }
  }, [currentInvoice]);

  // Async function to Add and Edit the Invoice
  async function addAndEditNewInvoice(recordFields) {
    const table = base.getTableByName(INVOICE_TABLE_NAME);

    if (table.hasPermissionToCreateRecord(recordFields)) {
      const newRecordId = await table.createRecordAsync(recordFields);
      const freshQueryResult = await table.selectRecordsAsync();
      expandRecord(freshQueryResult.getRecordById(newRecordId));
    }
  }

  // Async function to duplicate a record
  async function duplicateInvoice(recordFields) {
    const table = base.getTableByName(INVOICE_TABLE_NAME);
    let date = moment().format('YYYY-MM-DD');
    console.log('recordFields.id', recordFields.id);
    console.log(
      'recordFields.invoice date',
      recordFields.getCellValue('Invoice Date')
    );
    console.log('recordFields.status', recordFields.getCellValue('Status'));
    console.log('recordFields.Client', recordFields.getCellValue('Client'));
    console.log('recordFields.Terms', recordFields.getCellValue('Terms'));

    let duplicateInvoice = {
      'Invoice Date': date,
      Status: recordFields.getCellValue('Status'),
      Title: '[COPY] ' + recordFields.getCellValue('Title'),
      Description: recordFields.getCellValue('Description'),
      Notes: recordFields.getCellValue('Notes'),
      Itemization: recordFields.getCellValue('Itemization'),
      Client: recordFields.getCellValue('Client'),
      Terms: recordFields.getCellValue('Terms')
    };
    if (table.hasPermissionToCreateRecord(duplicateInvoice)) {
      const newRecordId = await table.createRecordAsync(duplicateInvoice);
      const freshQueryResult = await table.selectRecordsAsync();
      expandRecord(freshQueryResult.getRecordById(newRecordId));
    }
  }

  // Renders a <Toolbar> containing the universal controls for experience
  function Toolbar({ table }) {
    // TODO: Make data filter working
    // Sets the filter date value for invoices
    const SelectDate = () => {
      const [dateValue, setDateValue] = useState(SORT_OPTIONS[0].value);
      return (
        <Select
          marginLeft={2}
          width="25%"
          options={SORT_OPTIONS}
          value={dateValue}
          onChange={(newDateValue) => setDateValue(newDateValue)}
        />
      );
    };

    return (
      <Box
        padding={2}
        borderBottom="thick"
        className={HIDE_CLASS}
        style={{
          position: 'fixed',
          top: '0',
          width: '100%',
          backgroundColor: '#fffffff2'
        }}
      >
        <Button
          icon="plus"
          aria-label="Create new invoice"
          variant="primary"
          marginRight={2}
          onClick={async function () {
            await addAndEditNewInvoice(defaultInvoice);
          }}
        >
          Create new invoice
        </Button>
        <Button
          icon="print"
          aria-label="Print this view"
          variant="default"
          onClick={() => {
            printInvoice();
          }}
        >
          Print this view
        </Button>
        <Box padding={0} marginY={2} display="flex">
          <ViewPickerSynced
            table={table}
            globalConfigKey={GlobalConfigKeys.VIEW_ID}
          />
          <SelectDate />
        </Box>
      </Box>
    );
  }

  // Renders a <Record> for each of the records in the specified view.
  function Report({ view }) {
    const records = useRecords(view);

    if (!view) {
      return <div>Please pick a view above</div>;
    }

    return (
      <>
        {records.map((record) => {
          return <Record key={record.id} record={record} />;
        })}
      </>
    );
  }

  // Renders a grouping of records from the Invoice table
  function Record({ record }) {
    const linkedTable = base.getTableByName(INVOICE_TABLE_NAME);
    const linkedRecords = useRecords(
      record.selectLinkedRecordsFromCell('Invoice', {
        sorts: [
          {
            field: linkedTable.getFieldByNameIfExists('Invoice Date'),
            direction: 'desc'
          }
        ]
      })
    );
    let summaryAmount = 0;
    linkedRecords.forEach((linkedRecord) => {
      summaryAmount = summaryAmount + linkedRecord.getCellValue('Amount');
    });
    summaryAmount = new Intl.NumberFormat(REGION, {
      style: 'currency',
      currency: CURRENCY
    }).format(summaryAmount);

    return (
      <Box marginY={4} marginX={0}>
        <Heading size="small" display="inline-block" marginRight={1}>
          {record.getCellValueAsString('Company')} /
          <Text textColor="light" as="span" marginLeft={1}>
            {record.name}
          </Text>
        </Heading>
        <TextButton
          icon="edit"
          aria-label="Edit Invoice"
          variant="light"
          marginRight={3}
          className={HIDE_CLASS}
          onClick={() => {
            expandRecord(record);
          }}
        />
        <Text display="inline-block" style={{ float: 'right' }}>
          Total: {summaryAmount}
        </Text>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <td
                style={{
                  width: '10%',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'bottom'
                }}
              >
                <Heading
                  variant="caps"
                  size="xsmall"
                  marginRight={3}
                  marginBottom={0}
                >
                  Number
                </Heading>
              </td>
              <td
                style={{
                  width: '10%',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'bottom'
                }}
              >
                <Heading
                  variant="caps"
                  size="xsmall"
                  marginRight={3}
                  marginBottom={0}
                >
                  Invoice Date
                </Heading>
              </td>
              <td style={{ width: '50%', verticalAlign: 'bottom' }}>
                <Heading
                  variant="caps"
                  size="xsmall"
                  marginRight={3}
                  marginBottom={0}
                >
                  Summary
                </Heading>
              </td>
              <td
                style={{
                  width: '10%',
                  verticalAlign: 'bottom',
                  textAlign: 'center'
                }}
              >
                <Heading variant="caps" size="xsmall" marginBottom={0}>
                  Amount
                </Heading>
              </td>
              <td
                style={{ width: '20%', verticalAlign: 'bottom' }}
                className={HIDE_CLASS}
              ></td>
            </tr>
          </thead>
          <tbody>
            {linkedRecords.map((linkedRecord) => {
              // Pulls the itemization list
              const linkedItemizationTable = base.getTableByName(
                ITEMIZATION_TABLE_NAME
              );
              let linkedItemizationRecords = useRecords(
                linkedRecord.selectLinkedRecordsFromCell('Itemization')
              );

              // Pulls the Terms list
              const linkedTermsTable = base.getTableByName(TERMS_TABLE_NAME);
              let linkedTermsRecords = useRecords(
                linkedRecord.selectLinkedRecordsFromCell('Terms')
              );

              // Pulls the Company info
              const configTable = base.getTableByName(CONFIG_TABLE_NAME);
              let configRecords = useRecords(configTable);

              return (
                <tr
                  key={linkedRecord.id}
                  style={{ borderTop: '1px solid #ddd' }}
                >
                  <td style={{ verticalAlign: 'middle', padding: '10px 0' }}>
                    <Text marginRight={3}>{linkedRecord.name}</Text>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <Text marginRight={3}>
                      {moment(
                        linkedRecord.getCellValue('Invoice Date'),
                        'YYYY-MM-DD',
                        true
                      ).format('MMM D, YYYY')}
                    </Text>
                  </td>
                  <td
                    style={{
                      verticalAlign: 'middle'
                    }}
                  >
                    <div
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: '300px',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <Text marginRight={2} as="strong">
                        {linkedRecord.getCellValueAsString('Title')}
                      </Text>
                      <Text textColor="light" as="em">
                        {linkedRecord.getCellValueAsString('Description')}
                      </Text>
                    </div>
                  </td>
                  <td
                    style={{
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                      textAlign: 'right'
                    }}
                  >
                    <Text marginRight={3}>
                      {linkedRecord.getCellValueAsString('Amount')}
                    </Text>
                  </td>
                  <td
                    className={HIDE_CLASS}
                    style={{
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                      padding: '4px 0'
                    }}
                  >
                    <Button
                      icon="edit"
                      aria-label="Edit Invoice"
                      variant="secondary"
                      marginRight={3}
                      onClick={() => {
                        expandRecord(linkedRecord);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      icon="duplicate"
                      aria-label="Duplicate Invoice"
                      variant="secondary"
                      marginRight={3}
                      onClick={async function () {
                        await duplicateInvoice(linkedRecord);
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      icon="print"
                      aria-label="Print Invoice"
                      variant="default"
                      onClick={() => {
                        console.log('Print Invoice Button Pressed');
                        setCurrentClient(record);
                        setCurrentInvoiceItemization(linkedItemizationRecords);
                        setCurrentTerms(linkedTermsRecords);
                        setCompanyInformation(configRecords);
                        setCurrentInvoice(linkedRecord);
                      }}
                    >
                      Print
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    );
  }

  return (
    <div>
      <Toolbar table={table} />
      <Box margin={3} className="list" style={{ marginTop: '125px' }}>
        <Report view={view} />
      </Box>
      <Invoice
        currentInvoice={currentInvoice}
        currentClient={currentClient}
        currentTerms={currentTerms}
        currentInvoiceItemization={currentInvoiceItemization}
        companyInformation={companyInformation}
      />
    </div>
  );
}

initializeBlock(() => <InvoicerBlock />);
