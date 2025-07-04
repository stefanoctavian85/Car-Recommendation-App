import { Box, Button, Typography } from '@mui/material';
import './Error.css';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useNavigate } from 'react-router-dom';

function Error({ message }) {
    const navigate = useNavigate();

    return(
        <Box className='error-page'>
            <Box className='error-emoji'>
                <SentimentVeryDissatisfiedIcon fontSize='large' />
            </Box>

            <Box className='error-message'>
                <Typography className='error-message-text'>{message || "Something went wrong! Please try again later!"}</Typography>
            </Box>

            <Box className='error-home'>
                <Button
                    className='error-home-button'
                    variant='contained'
                    onClick={() => {
                        navigate('/');
                    }}
                >
                    Home
                </Button>
            </Box>
        </Box>
    );
}

export default Error;