import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import { WebView } from 'react-native-webview';

const Invoice = ({ route }) => {
  const { orderData } = route.params;

  // ✅ Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ Generate invoice HTML
  //   const generateInvoiceHtml = () => {
  //     // ✅ Format currency in round figures
  //     const formatCurrency = (num) => {
  //       const value = Math.round(Number(num) || 0);
  //       return 'Rs ' + value.toLocaleString('en-IN');
  //     };

  //     const subtotal = orderData.products.reduce(
  //       (acc, item) =>
  //         acc + (Number(item.discountedPrice) || 0) * (Number(item.quantity) || 0),
  //       0
  //     );

  //     const discount = Number(orderData.discountedAmount) || 0;
  //     const amountDue = subtotal - discount;

  //     return `
  //       <html>
  //       <head>
  //         <style>
  //           body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 20px; }
  //           h1 { color: #0056b3; font-size: 24px; margin-bottom: 20px; font-weight: bold; }
  //           hr { border: 0; border-top: 1px solid #333; margin: 10px 0; }

  //           table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
  //           th, td { border: 1px solid #333; padding: 6px; text-align: center; }
  //           th { background-color: #f6f6f6; font-weight: bold; }
  //           td.item-name { text-align: left; }

  //           .header-row { display: flex; justify-content: space-between; margin-bottom: 5px; flex-wrap: wrap; }
  //           .header-label { display: block; margin-bottom: 3px; font-weight: normal; }
  //           .section-title { margin-top: 10px; margin-bottom: 5px; font-weight: normal; }
  //           .info-block p { margin: 0; font-weight: normal; }

  //           .totals { margin-top: 15px; width: 100%; display: flex; justify-content: flex-end; }
  //           .totals-table { width: 300px; }
  //           .totals-row { display: flex; justify-content: space-between; margin: 5px 0; }
  //           .totals-row div { font-weight: normal; }
  //           .totals-row.amount-due div { font-weight: bold; }
  //           .footer { text-align: left; margin-top: 30px; font-size: 16px; font-weight: bold; color: #0056b3; }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>INVOICE</h1>

  //         <div class="header-row">
  //           <div><span class="header-label">INVOICE NO</span><strong>${orderData.orderId}</strong></div>
  //           <div><span class="header-label">DATE</span><strong>${formatDate(orderData.orderDate)}</strong></div>
  //           <div><span class="header-label">PAYMENT METHOD</span><strong>${orderData.paymentMethod || 'Cash on Delivery'}</strong></div>
  //           <div style="text-align:right;"><span class="header-label">FINAL AMOUNT</span><strong>${formatCurrency(amountDue)}</strong></div>
  //         </div>

  //         <hr />

  //         <div class="info-block">
  //           <div class="section-title"><strong>BILL TO:</strong></div>
  //           <p>${orderData.customerName},<br/>
  //           ${orderData.address},<br/>
  //           ${orderData.mobileNumber || ''}.</p>
  //         </div>

  //         <div class="info-block">
  //           <div class="section-title"><strong>BILL FROM:</strong></div>
  //           <p>Novelty Technologies,<br/>
  //           D/No. 25-84/42/FF502, Venu Dharani Apartment,<br/>
  //           P.M Palem, Revenue Ward 4,<br/>
  //           Visakhapatnam, Andhra Pradesh - 530048.<br/>
  //           +91 8121301888,<br/>
  //           hello.toyshack@gmail.com,<br/>
  //           GST Number:37AAYFN3829L1ZC.</p>
  //         </div>

  //         <hr/>

  //         <table>
  //           <thead>
  //             <tr>
  //               <th>Item</th>
  //               <th>Quantity</th>
  //               <th>Price</th>
  //               <th>Gross Amount</th>
  //               <th>Discount</th>
  //               <th>Taxable Value</th>
  //               <th>IGST</th>
  //               <th>CGST</th>
  //               <th>SGST</th>
  //               <th>CESS</th>
  //               <th>Total</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //  ${orderData.products
  //         .map((item) => {
  //           const price = Number(item.mainPrice) || 0;
  //           const quantity = Number(item.quantity) || 0;
  //           const grossAmount = price * quantity;

  //           const discountPercent = Number(item.discount) || 0;
  //           const discountAmount = (grossAmount * discountPercent) / 100;

  //           const taxableValue = grossAmount - discountAmount;

  //           const igstPercent = Number(item.igst) || 0;
  //           const cgstPercent = Number(item.cgst) || 0;
  //           const sgstPercent = Number(item.sgst) || 0;
  //           const cessPercent = Number(item.cess) || 0;

  //           const total = taxableValue;

  //           return `
  //                   <tr>
  //                     <td class="item-name">${item.productName}</td>
  //                     <td>${quantity}</td>
  //                     <td>${formatCurrency(price)}</td>
  //                     <td>${formatCurrency(grossAmount)}</td>
  //                     <td>${discountPercent} %</td>
  //                     <td>${formatCurrency(taxableValue)}</td>
  //                     <td>${igstPercent} %</td>
  //                     <td>${cgstPercent} %</td>
  //                     <td>${sgstPercent} %</td>
  //                     <td>${cessPercent} %</td>
  //                     <td>${formatCurrency(total)}</td>
  //                   </tr>`;
  //         })
  //         .join("")}
  //           </tbody>
  //         </table>

  //         <div class="totals">
  //           <div class="totals-table">
  //             <div class="totals-row">
  //               <div>Subtotal</div>
  //               <div>${formatCurrency(subtotal)}</div>
  //             </div>
  //             ${discount > 0
  //         ? `<div class="totals-row">
  //                     <div>Coupon ${orderData.couponCode ? `(${orderData.couponCode})` : ''}</div>
  //                     <div>- ${formatCurrency(discount)}</div>
  //                   </div>`
  //         : ''
  //       }
  //             <div class="totals-row amount-due">
  //               <div>Total Amount</div>
  //               <div>${formatCurrency(amountDue)}</div>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="footer">THANK YOU FOR YOUR PURCHASE!</div>
  //       </body>
  //       </html>
  //     `;
  //   };
  const generateInvoiceHtml = () => {
    const formatCurrency = (num) => {
      const value = Math.round(Number(num) || 0);
      return 'Rs ' + value.toLocaleString('en-IN');
    };

    const subtotal = orderData.products.reduce(
      (acc, item) =>
        acc + (Number(item.discountedPrice) || 0) * (Number(item.quantity) || 0),
      0
    );

    const discount = Number(orderData.discountedAmount) || 0;
    const amountDue = subtotal - discount;

    return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 20px; }
        hr { border: 0; border-top: 1px solid #333; margin: 10px 0; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: center; }
        th { background-color: #f6f6f6; font-weight: bold; }
        td.item-name { text-align: left; }

        .header-row { display: flex; justify-content: space-between; margin-bottom: 5px; flex-wrap: wrap; }
        .header-label { display: block; margin-bottom: 3px; }
        .section-title { margin-top: 10px; margin-bottom: 5px; }
        .info-block p { margin: 0; }

        .totals { margin-top: 15px; width: 100%; display: flex; justify-content: flex-end; }
        .totals-table { width: 300px; }
        .totals-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .totals-row.amount-due div { font-weight: bold; }
        .footer { text-align: left; margin-top: 30px; font-size: 16px; font-weight: bold; color: #0056b3; }
      </style>
    </head>

    <body>

      <!-- ⭐ Centered Logo + Title (same style as Swiggy invoice) -->
     <!-- ⭐ Only the LOGO has top & bottom border -->
<div style="
  text-align:center;
  margin-bottom:20px;
  margin-top:20px;
  // border-top:1px solid #333;
  border-bottom:1px solid #333;
  padding:10px 0;
">
  <img 
    src="https://dashboard.onlayn.toys/logo.png"
    style="width:180px; height:auto; margin:30px 0;"
  />
</div>


<h1 style="text-align:center; margin:0; padding:0; font-size:24px; margin-bottom:20px;color: #07227bff;">
  TAX INVOICE
</h1>



      <div class="header-row">
        <div><span class="header-label">INVOICE NO</span><strong>${orderData.orderId}</strong></div>
        <div><span class="header-label">DATE</span><strong>${formatDate(orderData.orderDate)}</strong></div>
        <div><span class="header-label">PAYMENT METHOD</span><strong>${orderData.paymentMethod || 'Cash on Delivery'}</strong></div>
        <div style="text-align:right;"><span class="header-label">FINAL AMOUNT</span><strong>${formatCurrency(amountDue)}</strong></div>
      </div>

      <hr />

      <div class="info-block">
        <div class="section-title"><strong>BILL TO:</strong></div>
        <p>${orderData.customerName},<br/>
        ${orderData.address},<br/>
        ${orderData.mobileNumber || ''}.</p>
      </div>

      <div class="info-block">
        <div class="section-title"><strong>BILL FROM:</strong></div>
        <p>Novelty Technologies,<br/>
        D/No. 25-84/42/FF502, Venu Dharani Apartment,<br/>
        P.M Palem, Revenue Ward 4,<br/>
        Visakhapatnam, Andhra Pradesh - 530048.<br/>
        +91 8121301888,<br/>
        contact.onlayn@gmail.com,<br/>
        GST Number:37AAYFN3829L1ZC.</p>
      </div>

      <hr/>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Gross Amount</th>
            <th>Discount</th>
            <th>Taxable Value</th>
            <th>IGST</th>
            <th>CGST</th>
            <th>SGST</th>
            <th>CESS</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.products.map((item) => {
      const price = Number(item.mainPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const grossAmount = price * quantity;

      const discountPercent = Number(item.discount) || 0;
      const discountAmount = (grossAmount * discountPercent) / 100;

      const taxableValue = grossAmount - discountAmount;

      const total = taxableValue;

      return `
              <tr>
                <td class="item-name">${item.productName}</td>
                <td>${quantity}</td>
                <td>${formatCurrency(price)}</td>
                <td>${formatCurrency(grossAmount)}</td>
                <td>${discountPercent} %</td>
                <td>${formatCurrency(taxableValue)}</td>
                <td>${item.igst || 0} %</td>
                <td>${item.cgst || 0} %</td>
                <td>${item.sgst || 0} %</td>
                <td>${item.cess || 0} %</td>
                <td>${formatCurrency(total)}</td>
              </tr>`;
    }).join("")}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-table">
          <div class="totals-row">
            <div>Subtotal</div>
            <div>${formatCurrency(subtotal)}</div>
          </div>

          ${discount > 0
        ? `<div class="totals-row">
                <div>Coupon ${orderData.couponCode ? `(${orderData.couponCode})` : ''}</div>
                <div>- ${formatCurrency(discount)}</div>
              </div>`
        : ''
      }

          <div class="totals-row amount-due">
            <div>Total Amount</div>
            <div>${formatCurrency(amountDue)}</div>
          </div>
        </div>
      </div>

      <div class="footer">THANK YOU FOR YOUR PURCHASE!</div>

    </body>
    </html>
  `;
  };

  // ✅ Print Invoice
  const handlePrintInvoice = async () => {
    try {
      const htmlContent = generateInvoiceHtml();
      const fileName = `invoice_${orderData.orderId}.pdf`;

      await RNPrint.print({
        html: htmlContent,
        jobName: fileName,
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
      Alert.alert('Error', 'Failed to print the invoice.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBar}>
        <Icon
          name="printer"
          size={30}
          color="black"
          onPress={handlePrintInvoice}
          style={{ marginTop: 50, margin: 10 }}
        />
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html: generateInvoiceHtml() }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
});

export default Invoice;
