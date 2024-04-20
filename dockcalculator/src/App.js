import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function App() {

  const styles = {
    productContainer: {
      border: '1px solid #ccc',
      padding: '10px',
      margin: '5px',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9f9f9'
    },
    productName: {
      flexGrow: 1
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    addButton: {
      marginLeft: '10px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px 0'
    },
    button: {
      padding: '10px 20px',
      margin: '0 10px',
      background: '#f0f0f0',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    activeButton: {
      padding: '10px 20px',
      margin: '0 10px',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    mainContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginLeft: '20px',  // Add margin to the left side of the entire container
    },
    productSection: {
      width: '70%',
      paddingRight: '20px'
    },
    cartSection: {
      width: '30%',
      borderLeft: '1px solid #ccc',
      paddingLeft: '20px'
    },
    productContainer: {
      border: '1px solid #ccc',
      padding: '10px',
      margin: '5px 0',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9f9f9'
    },
    productName: {
      flexGrow: 1,
      marginRight: '10px' // Ensuring there's space between name and price
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    addButton: {
      marginLeft: '10px'
    },
    cartItemContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '10px 0',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px'
    },
    cartItemControls: {
      display: 'flex',
      alignItems: 'center'
    },
    cartButton: {
      margin: '0 5px',
      padding: '5px 10px',
      cursor: 'pointer'
    },
    quantity: {
      minWidth: '20px',
      textAlign: 'center'
    },
    productDetail: {
      flexGrow: 1,
      marginRight: '10px'
    },
    cartPrice: {
      marginLeft: '5px',
      fontWeight: 'bold'
    },
    cartItemControls: {
      display: 'flex',
      alignItems: 'center'
    },
    quantityInput: {
      width: '50px',
      marginRight: '5px',
      textAlign: 'center'
    },
    cartButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#c00'
    },
    titleSection: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f7f7f7',
    borderBottom: '1px solid #ccc',
    color: '#333'
  },
  dragDropArea: {
    border: '2px dashed #ccc',
    borderRadius: '5px',
    padding: '20px',
    textAlign: 'center',
    margin: '20px',
    backgroundColor: '#fafafa'
  }
  };



  const [productData, setProductData] = useState({});
  const [cart, setCart] = useState([]);
  const [priceIndex, setPriceIndex] = useState(0); // Index to control which price to show

  const priceOptions = [
    { label: "Suggested Retail", index: 0 },
    { label: "Dealer Price", index: 1 },
    { label: "5% Discount", index: 2 },
    { label: "10% Discount", index: 3 }
  ];

  const handleQuantityChange = (event, item) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (newQuantity >= 1) {
      setCart(cart.map(cartItem =>
        cartItem.name === item.name ? { ...cartItem, quantity: newQuantity } : cartItem
      ));
    }
  };

  const handlePriceChange = (index) => {
    console.log("Changing price index from", priceIndex, "to", index);
    setPriceIndex(index);
  };

  const increaseQuantity = (item) => {
    setCart(cart.map(cartItem =>
      cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
    ));
  };

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      ));
    } else {
      removeFromCart(item);
    }
  };

  const removeFromCart = (item) => {
    setCart(cart.filter(cartItem => cartItem.name !== item.name));
  };


  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheets = workbook.SheetNames.reduce((sheets, name) => {
          const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "", blankrows: false });
          let sections = [];
          let currentSection = { title: "General", items: [] };
          let potentialHeader = "";

          sheet.forEach((row, rowIndex) => {
            // Ignore rows explicitly named "Item"
            if (row[0] === "ITEM") {
              return;
            }

            // Check if any cell in the row is numeric to classify as a product row
            if (row.some(cell => !isNaN(parseFloat(cell)) && isFinite(cell))) {
              if (potentialHeader) { // If there was a header before this, start a new section
                if (currentSection.items.length > 0 || currentSection.title !== "General") {
                  sections.push(currentSection);
                }
                currentSection = { title: potentialHeader, items: [] };
                potentialHeader = ""; // Reset potential header since it's now used
              }
              currentSection.items.push({
                name: row[0],
                prices: row.slice(1).map(price => parseFloat(price))
              });
            } else if (row[0]) {
              // Capture this as a potential header, which will be used only if followed by a product row
              potentialHeader = row[0];
            }
          });

          // Add the last section if not already added and it has items
          if (currentSection.items.length > 0) {
            sections.push(currentSection);
          }

          sheets[name] = sections;
          return sheets;
        }, {});
        setProductData(sheets);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleAddProduct = (product) => {
    const price = product.prices[priceIndex];
    const itemInCart = cart.find(item => item.name === product.name && item.price === price);
    if (itemInCart) {
      setCart(cart.map(item =>
        item.name === product.name && item.price === price ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { name: product.name, price, quantity: 1 }]);
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div style={styles.mainContainer}>
      <div style={styles.productSection}>
      <div style={styles.titleSection}>
        <h1>Product Calculator</h1>
      </div>
      <div {...getRootProps()} style={styles.dragDropArea}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop your file here, or click to select file</p>
      </div>
        <div style={styles.buttonContainer}>
          {priceOptions.map(option => (
            <button
            key={option.label}
            onClick={() => handlePriceChange(option.index)}
            style={priceIndex === option.index ? styles.activeButton : styles.button}
          >
            {option.label}
          </button>
          ))}
        </div>
        <Tabs>
          <TabList>
            {Object.keys(productData).map((category, index) => (
              <Tab key={index}>{category}</Tab>
            ))}
          </TabList>

          {Object.keys(productData).map((category, index) => (
  <TabPanel key={index}>
    {productData[category].map((section, secIndex) => (
      <div key={secIndex}>
        <h3 style={{ backgroundColor: '#e89c7b', padding: '10px', marginTop: '20px' }}>{section.title}</h3>
        {section.items.length > 0 ? (
          section.items.map((product, prodIndex) => (
            <div key={prodIndex} style={styles.productContainer}>
              <span style={styles.productName}>{product.name}</span>
              <div style={styles.priceContainer}>
                <span>
                  ${product.prices[priceIndex] ? product.prices[priceIndex].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A"}
                </span>
                <button style={styles.addButton} onClick={() => handleAddProduct(product)}>Add</button>
              </div>
            </div>
          ))
        ) : <p>No items in this section.</p>}
      </div>
    ))}
  </TabPanel>
))}
        </Tabs>
      </div>
      <div style={styles.cartSection}>
        <h2>Cart</h2>
        {cart.map((item, index) => (
          <div key={index} style={styles.cartItemContainer}>
            <div style={styles.productDetail}>
              <span>{item.name} - </span>
              <span style={styles.cartPrice}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={styles.cartItemControls}>
              <input
                type="number"
                min="1"
                style={styles.quantityInput}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(e, item)}
              />
              <button onClick={() => removeFromCart(item)} style={styles.cartButton}>
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
        <h3>Total: ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
      </div>

    </div>
  );

}

export default App;
