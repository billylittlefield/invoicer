import React from 'react';
import moment from 'moment';
import loadInvoiceCSS from './loadInvoiceCSS';

export default function Invoice({
  currentInvoice,
  currentInvoiceItemization,
  currentClient,
  currentTerms,
  companyInformation,
  companyLogo
}) {
  if (!currentInvoice) {
    return null;
  }

  loadInvoiceCSS(); // Loads the Invoice print CSS

  // Interface labels, pulled from table.
  let txtBalanceDue = companyInformation[0].getCellValueAsString('Balance Due');
  let txtRemitTo = companyInformation[0].getCellValueAsString('Remit To');
  let txtBillTo = companyInformation[0].getCellValueAsString('Bill To');
  let txtTerms = companyInformation[0].getCellValueAsString('Terms');
  let txtProject = companyInformation[0].getCellValueAsString('Project');
  let txtDescription = companyInformation[0].getCellValueAsString(
    'Description'
  );
  let txtInvoiceNumber = companyInformation[0].getCellValueAsString(
    'Invoice Number'
  );
  let txtInvoiceDate = companyInformation[0].getCellValueAsString(
    'Invoice Date'
  );

  /*
  let companyLogo = companyInformation[0].getCellValueAsString('Logo');

  companyLogo =
    'https://dl.airtable.com/.attachments/c6fcc84c5294f958cea98d2abb0f5c01/322efafa/MixableLogo.png';
*/
  console.log(companyLogo);

  return (
    <div className="invoice">
      <header>
        <table>
          <tbody>
            <tr>
              <td>
                <img
                  alt="Company Logo"
                  src="https://dl.airtable.com/.attachments/c6fcc84c5294f958cea98d2abb0f5c01/322efafa/MixableLogo.png"
                  style={{
                    width: '6cm',
                    height: '2cm',
                    display: 'block'
                  }}
                />
                <div className="logo">
                  <a href={companyLogo}>{companyLogo}</a>
                </div>
              </td>
              <td>
                <dl>
                  <dt>{txtInvoiceNumber}</dt>
                  <dd>{currentInvoice.name}</dd>
                  <dt>{txtInvoiceDate}</dt>
                  <dd>
                    {moment(
                      currentInvoice.getCellValue('Invoice Date'),
                      'YYYY-MM-DD',
                      true
                    ).format('MMMM D, YYYY')}
                  </dd>
                  <dt>
                    <strong>{txtBalanceDue}</strong>
                  </dt>
                  <dd>
                    <strong>
                      {currentInvoice.getCellValueAsString('Amount')}
                    </strong>
                  </dd>
                </dl>
              </td>
            </tr>
          </tbody>
        </table>
      </header>
      <main>
        <h2>{txtProject}</h2>
        <div className="projectName">
          <h1>{currentInvoice.getCellValueAsString('Title')}</h1>
          <p>{currentInvoice.getCellValueAsString('Description')}</p>
        </div>
        <h2>{txtDescription}</h2>
        <table>
          <tbody>
            {currentInvoiceItemization.map((linkedItemizationRecord) => {
              let notes = linkedItemizationRecord.getCellValueAsString('Notes');
              return (
                <tr key={linkedItemizationRecord.id}>
                  <td style={{ width: '80%', verticalAlign: 'top' }}>
                    <ul>
                      <li>
                        {linkedItemizationRecord.name}
                        {notes && <em>{notes}</em>}
                      </li>
                    </ul>
                  </td>
                  <td
                    style={{
                      width: '20%',
                      textAlign: 'right',
                      verticalAlign: 'top'
                    }}
                  >
                    <div style={{ padding: '0 0.2cm 0 0' }}>
                      {linkedItemizationRecord.getCellValueAsString('Amount')}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <table
                  style={{
                    float: 'right',
                    width: '45%',
                    border: '2px solid #333333',
                    padding: '0.1cm',
                    margin: '1cm 0'
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: '50%',
                          fontWeight: 'bold',
                          textAlign: 'left'
                        }}
                      >
                        {txtBalanceDue}
                      </td>
                      <td
                        style={{
                          width: '50%',
                          textAlign: 'right',
                          fontWeight: 'bold'
                        }}
                      >
                        {currentInvoice.getCellValueAsString('Amount')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tfoot>
        </table>
        <h2>{txtTerms}</h2>
        {currentTerms.map((currentTerm) => {
          let terms = currentTerm.getCellValueAsString('Description');
          return (
            <p
              key={currentTerm.id}
              style={{ whiteSpace: 'pre-wrap', display: 'block' }}
            >
              {terms}
            </p>
          );
        })}
        <p>{currentInvoice.getCellValueAsString('Notes')}</p>
      </main>
      <footer>
        <table>
          <tbody>
            <tr>
              <td>
                <h2>{txtBillTo}</h2>
                <p>
                  {currentClient.getCellValueAsString('Company')}
                  <br />
                  <span style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                    {currentClient.getCellValueAsString('Address')}
                  </span>
                  {currentClient.getCellValueAsString('Email')}
                  <br />
                  {currentClient.getCellValueAsString('Phone')}
                </p>
              </td>
              <td>
                <h2>{txtRemitTo}</h2>
                {companyInformation.map((info) => {
                  return (
                    <p key={info.id}>
                      {info.getCellValueAsString('Name')}
                      <br />
                      <span
                        style={{ whiteSpace: 'pre-wrap', display: 'block' }}
                      >
                        {info.getCellValueAsString('Address')}
                      </span>
                      {info.getCellValueAsString('Email')}
                      <br />
                      {info.getCellValueAsString('Phone')}
                    </p>
                  );
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </footer>
    </div>
  );
}
