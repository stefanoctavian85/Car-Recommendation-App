import './EmblaCarousel.css';
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { Box, Button, CardMedia, Typography } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

function EmblaCarousel({ images }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [finalLinks, setFinalLinks] = useState([]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollPrev();
        }
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollNext();
        }
    }, []);

    useEffect(() => {
        let imageLinks = images.split(', ');
        let links = [];
        const pattern = /^(https:\/\/[^,]+\/image)/;
        imageLinks.forEach(link => {
            let finalLink = link.trim().match(pattern);
            links.push(finalLink);
        });
        setFinalLinks(links);
    }, [images]);

    return (
        <Box className='embla'>
            <Box className='embla__viewport' ref={emblaRef}>
                <Box className='embla__container'>
                    {
                        finalLinks && finalLinks.length > 0 ? (
                            finalLinks.map((image, index) => (
                                <Box className='embla__slide' key={index}>
                                    <CardMedia
                                        className='embla__slide-img'
                                        component='img'
                                        src={image}
                                        srcSet={image}
                                        alt={`Car image ${index + 1}`}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Box className='embla__no-images'>
                                <Typography component='h2'>No images found!</Typography>
                            </Box>
                        )
                    }
                </Box>

                <Box className='embla__buttons'>
                    <NavigateBeforeIcon className='prev-button' onClick={scrollPrev}/>
                    <NavigateNextIcon className='next-button' onClick={scrollNext} />
                </Box>
            </Box>
        </Box>
    );
}

export default EmblaCarousel;