// ...existing code...
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, IconButton, Grid, Card,
  Tabs, Tab, Paper, Chip, TextField, Select, MenuItem
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import { getProductById } from "../../services/ProductService";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import "./FragranceDetail.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FragranceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("100ml");
  const [tabValue, setTabValue] = useState(0);
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProductById(id)
      .then((p) => {
        if (!mounted) return;
        setProduct(p || null);
        setMainImage((p && (p.images?.[0]?.url || p.image)) || "/images/dior1.jpg");
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setProduct(null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleWishlistClick = useCallback(async () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
    }
  }, [isAuthenticated, navigate, toggleWishlist, product]);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, size: selectedSize });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Box className="pd-loading">Loading…</Box>;
  if (!product) return <Box className="pd-notfound">Product not found</Box>;

  const prodId = product.id || product._id;
  const inWishlist = Array.isArray(wishlist) && wishlist.some((p) => (p.id || p._id) === prodId);
  const images = Array.isArray(product.images) && product.images.length
    ? product.images.map((i) => i.url)
    : product.image ? [product.image] : ["/images/dior1.jpg"];
  const priceText = product.price ? `R ${Number(product.price).toFixed(2)}` : "N/A";
  const stockStatus = product.stock > 5 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock";
  const stockColor = product.stock > 5 ? "success" : product.stock > 0 ? "warning" : "error";

  return (
    <Box component="main" className="product-detail fade-in" role="main">
      <Button
        startIcon={<ArrowBackIosNewIcon fontSize="small" />}
        onClick={() => navigate(-1)}
        className="pd-back"
        aria-label="Go back"
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Box className="main-image-wrapper" sx={{ position: 'relative', mb: 2 }}>
              <img src={mainImage} alt={product.name} className="main-image" />
              {product.onSale && <Chip label="Sale" color="secondary" sx={{ position: 'absolute', top: 16, left: 16 }} />}
            </Box>

            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', pb: 1 }}>
                {images.map((src, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={src}
                    onClick={() => setMainImage(src)}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: mainImage === src ? '2px solid #6f8b8b' : '1px solid rgba(255,255,255,0.1)',
                      opacity: mainImage === src ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                      '&:hover': { opacity: 1 }
                    }}
                    alt={`View ${i + 1}`}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>
              {product.category}
            </Typography>
            
            <Typography variant="h3" component="h1" sx={{ my: 1, fontFamily: '"Playfair Display", serif' }}>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                {priceText}
              </Typography>
              <Chip
                label={stockStatus}
                color={stockColor}
                variant="outlined"
                size="small"
              />
            </Box>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            {/* Size Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Select Size
              </Typography>
              <Select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                fullWidth
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <MenuItem value="50ml">50ml - Travel Size</MenuItem>
                <MenuItem value="100ml">100ml - Standard</MenuItem>
                <MenuItem value="200ml">200ml - Luxe</MenuItem>
              </Select>
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Quantity
              </Typography>
              <TextField
                type="number"
                inputProps={{ min: 1, max: product.stock }}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{
                  width: 120,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.05)'
                  }
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingBagIcon />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{
                  flex: 1,
                  background: 'linear-gradient(180deg, rgba(111,168,139,0.14), rgba(111,168,139,0.06))',
                  color: '#6fa88b',
                  border: '1px solid rgba(91,143,113,0.12)',
                  '&:hover': { background: 'rgba(111,168,139,0.2)' },
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontWeight: 700,
                  py: 1.5
                }}
              >
                Add to Cart
              </Button>

              <IconButton
                onClick={handleWishlistClick}
                sx={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  color: inWishlist ? '#d17a7a' : 'inherit',
                  p: 1.5
                }}
              >
                {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>

            {/* Trust Indicators */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.6)' }}>
                <LocalShippingIcon fontSize="small" />
                <Typography variant="caption">Free shipping on orders over R500</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.6)' }}>
                <VerifiedIcon fontSize="small" />
                <Typography variant="caption">30-day money-back guarantee</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs for Details */}
      <Paper elevation={0} sx={{ mt: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': { textTransform: 'uppercase', letterSpacing: 1 }
          }}
        >
          <Tab label="Fragrance Notes" />
          <Tab label="Details" />
          <Tab label="Shipping & Returns" />
        </Tabs>

        {/* Fragrance Notes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ background: 'rgba(255,255,255,0.05)', p: 2, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)' }}>Top Notes</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {product.fragranceNotes?.topNotes?.join(', ') || 'N/A'}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ background: 'rgba(255,255,255,0.05)', p: 2, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)' }}>Middle Notes</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {product.fragranceNotes?.middleNotes?.join(', ') || 'N/A'}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={0} sx={{ background: 'rgba(255,255,255,0.05)', p: 2, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)' }}>Base Notes</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {product.fragranceNotes?.baseNotes?.join(', ') || 'N/A'}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Product Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase' }}>SKU</Typography>
              <Typography>{product.sku || prodId}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase' }}>Category</Typography>
              <Typography>{product.category}</Typography>
            </Grid>
            {product.brand && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase' }}>Brand</Typography>
                <Typography>{product.brand}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase' }}>Stock</Typography>
              <Typography>{product.stock} units available</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Shipping & Returns Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Shipping Information</Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
            Standard delivery takes 5-7 business days. Free shipping on orders over R500.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Returns & Exchanges</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, simply return it within 30 days for a full refund.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
}
// ...existing code...