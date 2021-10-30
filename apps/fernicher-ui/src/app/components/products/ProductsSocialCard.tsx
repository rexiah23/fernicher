import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useParams } from 'react-router-dom';
import { isEmpty, map, trim } from 'lodash';
import axios from 'axios';
import { stateContext } from '../../providers/StateProvider';
import { Data } from '@react-google-maps/api';

export default function ProductsSocialCard(props: {
  usersAndProduct: any;
  setUsersAndProduct: any;
  showProduct?: any;
  maxWidth?: any;
  minWidth?: any;
  setExpanded: any;
  expanded: any;
  commentExpanded: any;
  setCommentExpanded: any;
}) {
  const { userid } = useParams<{ userid: string }>();
  const { setMyProducts } = useContext(stateContext);
  const {
    usersAndProduct,
    setUsersAndProduct,
    showProduct,
    expanded,
    setExpanded,
    commentExpanded,
    setCommentExpanded,
    maxWidth = 345,
    minWidth,
  } = props;
  const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth,
      minWidth,
    },
    media: {
      paddingTop: '56.25%', // 16:9
      '&:hover': {
        cursor: 'pointer',
      },
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));
  const classes = useStyles();
  const [deleteMessage, setDeleteMessage] = useState('false');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState('');
  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>
            {usersAndProduct.user.firstName}
          </Avatar>
        }
        action={
          <IconButton
            aria-label="settings"
            style={{ visibility: isEmpty(userid) ? 'hidden' : 'inherit' }}
            onClick={() => {
              setShowDelete(true);
              setDeleteMessage('Are you sure you want to delete this product?');
            }}
          >
            <DeleteIcon />
          </IconButton>
        }
        title={usersAndProduct.name}
        // need to convert geolocation to location
        subheader={usersAndProduct.location}
      />
      <Dialog
        open={showDelete}
        onClose={setShowDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Delete Confirmation'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {deleteMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {!deleting && (
            <>
              <Button
                onClick={() => {
                  if (!isEmpty(userid)) {
                    setDeleteMessage('Deleting...');
                    setDeleting(true);
                    setTimeout(() => {
                      axios
                        .delete(`/api/products/${usersAndProduct.id}`)
                        .then(() => {
                          setMyProducts([]);
                          setDeleted(true);
                          setDeleteMessage('Product deleted.');
                        });
                    }, 1000);
                  }
                }}
              >
                Yes
              </Button>
              <Button onClick={() => setShowDelete(false)} autoFocus>
                No
              </Button>
            </>
          )}
          {deleted && (
            <Button onClick={() => setShowDelete(false)} autoFocus>
              Ok
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <CardMedia
        className={classes.media}
        image={usersAndProduct.image}
        title={usersAndProduct.name}
        onClick={() => showProduct && showProduct(usersAndProduct.id)}
      />
      <CardContent></CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <Badge badgeContent={usersAndProduct.id} color="primary">
            <FavoriteIcon />
          </Badge>
        </IconButton>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: commentExpanded,
          })}
          onClick={() =>
            setCommentExpanded(usersAndProduct.id, !commentExpanded)
          }
          aria-expanded={commentExpanded}
          aria-label="comment"
        >
          <ChatBubbleOutlineIcon />
        </IconButton>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={() => setExpanded(usersAndProduct.id, !expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {usersAndProduct.description}
          </Typography>
        </CardContent>
      </Collapse>
      <Collapse in={commentExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <TextField
            margin="dense"
            id="name"
            label="write a comment..."
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isEmpty(trim(comment))) {
                console.log(comment);
                setComment('');
                axios
                  .post('/api/comments/new', {
                    comment,
                    productId: usersAndProduct.id,
                    userId: 2,
                  })
                  .then((result) => {
                    setUsersAndProduct({
                      ...usersAndProduct,
                      comments: [result.data, ...usersAndProduct.comments],
                    });
                  });
              }
            }}
          />
          {map(usersAndProduct.comments, (com) => {
            return (
              <div key={com.id}>
                {com.user.firstName} - {com.comment}
              </div>
            );
          })}
        </CardContent>
      </Collapse>
    </Card>
  );
}
