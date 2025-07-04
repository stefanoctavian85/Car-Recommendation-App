import './EmblaCarousel.css';
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { Box, CardMedia } from "@mui/material";
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
    }, [emblaApi]);

    useEffect(() => {
        let imageLinks = images ? images.split(', ') : [];
        let links = [];
        const pattern = /^(https:\/\/[^,]+\/image)/;
        imageLinks.forEach(link => {
            let finalLink = link.trim().match(pattern);
            if (finalLink) {
                links.push(finalLink[0]);
            }
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
                        ) : null
                    }
                </Box>

                <Box className='embla__buttons'>
                    <NavigateBeforeIcon role='button' aria-label='Previous image' className='prev-button' onClick={scrollPrev}/>
                    <NavigateNextIcon role='button' aria-label='Next image' className='next-button' onClick={scrollNext} />
                </Box>
            </Box>
        </Box>
    );
}

export default EmblaCarousel;