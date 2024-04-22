import React, { useState, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Link } from '@mui/material';
import cancers from '../utils/cancer-list';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Info  from '@mui/icons-material/Info';
import CameraAlt from '@mui/icons-material/CameraAlt';
import { Help, Home } from '@mui/icons-material';
import Button from '@mui/material/Button';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    '&::placeholder': {
      color: 'white', // Placeholder text color
      opacity: 1, // Make sure the placeholder is fully visible
    },
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const clickableStyle = {
  cursor: 'pointer',
  display: 'inline', // Make sure it's inline to wrap the text only
  color: 'white', // This line changes the text color to white
  fontWeight: 'bold', // This line makes the text bold
};

export default function SearchAppBar() {
  const [searchTerm, setSearchTerm] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [open, setOpen] = useState(false); // Dialog 열림/닫힘 상태 관리
  const navigate = useNavigate();

  const iconArray = [<Home />, <CameraAlt />, <Info />, <Help />];
  
  const [state, setState] = React.useState({
    left: false,
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for later use
      setInstallPrompt(e);
      // Update UI to show install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, left: open });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (cancers.includes(searchTerm)) {
        setSelectedValue(searchTerm);     
        setOpen(true);
      }
    }
  };

  const handleMain = () => {
    navigate('/');
    setSearchTerm(null);
    // setSelectedValue(null);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {[['Home', 'Landing Page'],
          ['Main', 'Main'],].map((item, index) => (
          <ListItem key={item[0]} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item[0] === 'Home' ? '/' : `/${item[0]}`}>
              <ListItemIcon>
                {iconArray[index % iconArray.length]}
              </ListItemIcon>
              <ListItemText primary={item[1]} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );

  const handleInstallClick = async () => {
    if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await installPrompt.userChoice;
      // Optionally, send analytics event with outcome of prompt
      console.log(`User response to the install prompt: ${outcome}`);
      // Clear the install prompt as it can't be used again
      setInstallPrompt(null);
      setIsInstallable(false);
    } else {
      // Alert the user that the app can't be installed at this moment
      alert("The app can't be installed right now. Try again later.");
    }
  };
  
  

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* <AppBar position="static" color="success"> */}
      <AppBar position="static" color="default" sx={{ backgroundColor: '#1E407C'}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon/>
          </IconButton>
            <Drawer
              anchor="left"
              open={state.left}
              onClose={toggleDrawer(false)}
            >
              {list()}
            </Drawer>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
          <span 
            style={clickableStyle}
            onClick={handleMain}
          > PSU SCD APP</span>
          </Typography>
          <Button 
            color="inherit"  // Maintains the text color inheritance, which we will override
            onClick={handleInstallClick}
            sx={{ 
              marginLeft: 'auto', 
              color: 'white',  // Sets the text color to white
              backgroundColor: 'orange',  // Sets the background color to orange
              '&:hover': {  // Styles for hover state
                backgroundColor: 'darkorange'  // Darkens the orange on hover for a visual effect
              }
            }}
          >
            Install App
          </Button>

        </Toolbar>
      </AppBar>
    </Box>
  );
}

