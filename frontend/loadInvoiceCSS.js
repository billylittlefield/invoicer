import { loadCSSFromString } from '@airtable/blocks/ui';

const cssString = `
.invoice {
    display: none;
}
@media print {
    body {
        background-color: #fff;
        margin: 0;
        padding: 1cm;
    }
    .logo {
        width: 6cm;
        height: 2cm;
        background-repeat: no-repeat;
        overflow: hidden;
        background-position: 50% 50%;
        background-size: contain;
    }
    table {
        width: 100%;
    }
    table td {
        width: 50%;
        padding: 0.1cm 0;
    }
    table ul {
        padding-left: 0.5cm;
        margin: 0;
        list-style-type: square;
    }
    table ul li {
    }
    dl {
        display: block;
        padding: 0; 
        margin: 0;
        width: 100%;
    }
    dl dt {
        display: inline-block;
        width: 50%;
        padding: 0.25cm 0;
        margin: 0;
        font-size: 10pt;
    }
    dl dd {
        display: inline-block;
        width: 50%;
        padding: 0.25cm 0;
        margin: 0;
        font-size: 10pt;
    }
    strong {
        font-weight: bold;
    }
    .projectName {
        padding: 0 0 1cm 0;                
    }
    .projectName h1 {
        font-size: 16pt;
        padding: 0;
        margin: 0;
    }
    .projectName p {
        font-size: 10pt;
        padding: 0;
        margin: 0.2cm 0;
    }
    h2 {
        border-top: 2px solid #ddd;
        text-transform: uppercase;
        font-size: 10pt;
    }
    p {
        font-size: 10pt;
        padding: 0 0 1cm 0;
    }
    em {
        display: block;
    }
    header {
        height: 4cm;
    }
    footer {
        position: absolute;
        bottom: 0;
        min-height: 4cm;
        width: calc(100% - 2cm);
    }
    footer table {
        border-collapse: collapse !important;
        border: 0;
        padding: 0;
        margin: 0;
        width: 100%;
    }
    footer table td {
        width: 50%;
        vertical-align: top;
    }
}
`;

/**
 * Function that loads CSS to page
 */
function loadCSS() {
  loadCSSFromString(cssString);
}

export default loadCSS;
