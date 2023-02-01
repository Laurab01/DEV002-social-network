
import { onNavigate } from "../../main.js";
import { submitPost, logOut, getAllPosts, deletePost, currentUserInfo, getTask, updateTask, giveLike, dislike } from "../index.js";


export const login = () => {
  const divLogin = document.createElement('div');
  divLogin.setAttribute('id', 'div-login');
  const viewLogin = `
  <html>
  <header>
      <img src='./images/logo.png' alt='logoReading' class='logo-header'>
      <input type='image' id='btn-sign-out' src='../../images/logout.png'></input>
      <div class='container-images'>
      </div>
  </header>
  <main id='container-post'>
      <div id='container-btn-input'>
          <img id='img-input' src='images/user.png' alt='profile'>
          <button type='button' id='btn-input-modal'>Deja aqui la reseña de tu libro...</button>
      </div>
      <div id='timeline-posts'></div>
      <div id='modal-background-post'>
          <div id='modal-content-post'>
              <div id='space-line'>
                  <p>Crear Reseña</p>
                  <img src='images/close.png' class='btn-exit'>
              </div>
              <div id='line'></div>
              <div id='after-line'>
                  <div id='container-img-text'>
                      <img id='img-modal-post' src='images/user.png' alt='profile'>
                      <div id='container-text'></div>
                      </div>
                      <textarea type='text' id='input-post' placeholder='Deja aquí la reseña de tu libro'> </textarea>
                      <button disabled type='button' id='btn-post' class='btn-post-inactive'>PUBLICAR</button>  
                  </div>
              </div>
          <div id='div-post'></div>
          </div>
  </main>
  <footer>© 2022 desarrollado por Sandra, Laura B. y Laura G.</footer>
  </html>`;

  divLogin.innerHTML = viewLogin;

  const divTimeLine = divLogin.querySelector('#timeline-posts');
  const inputPostText = divLogin.querySelector('#input-post');
  const btnPost = divLogin.querySelector('#btn-post');
  const btnLogout = divLogin.querySelector('#btn-sign-out');
  const btnCreatePost = divLogin.querySelector('#btn-input-modal');
  const btnExit = divLogin.querySelector('.btn-exit');
  const divModalBackground = divLogin.querySelector('#modal-background-post');
  const divModalContent = divLogin.querySelector('#modal-content-post');

  
  //funcion que llama getDocs de firestore y re pinta los html elements para mostrar
  const refreshPosts = () => {

    getAllPosts().then((posts) => {
      divTimeLine.innerHTML = '';
      posts.forEach(post => {
        const postData = post.data();
        const uid = currentUserInfo().uid;
        console.log(uid);
        let divPostEntry = document.createElement("div");

        let imgUser = document.createElement("img");
        let userName = document.createElement("h2");
        let userPostText = document.createElement("h2");
        let editIcon = document.createElement('img');
        let dateTimePost = document.createElement("h1");
        let deleteIcon = document.createElement('img');
        let likePost = document.createElement('img');

        divPostEntry.className = "timeLine-post";
        imgUser.setAttribute('src', 'images/user.png');
        imgUser.className = "iconUser";
        userName.innerHTML = postData.user;
        userName.className = 'user-name-post';
        userPostText.innerHTML = postData.postText;
        deleteIcon.setAttribute('src', '/images/delete.png');
        deleteIcon.className = 'delete-icon';
        deleteIcon.setAttribute('data-id', post.id);
        deleteIcon.onclick = deletePostListener;
        userPostText.className = 'textPost';
        dateTimePost.innerHTML = new Date(post.data().createdDateTime.seconds * 1000).toLocaleString();
        dateTimePost.className = 'date-post';
        editIcon.setAttribute('data-id', post.id);
        editIcon.onclick = editPost;
        editIcon.setAttribute('src', 'images/editar.png');
        editIcon.className = 'icon-edit';
        likePost.className = 'primer-like';
        likePost.onclick = likedPost;
        likePost.setAttribute('data-id', post.id);

        if (postData.likes.some((like) => like === uid)) {
          likePost.setAttribute('src', '/images/2dolike.png');
        }
        else {
          likePost.setAttribute('src', '/images/1erlike.png');
        }

        if (postData.uid === currentUserInfo().uid) {
          divPostEntry.appendChild(userName);
          userName.appendChild(imgUser);
          divPostEntry.appendChild(userPostText);
          userName.appendChild(dateTimePost);
          userPostText.appendChild(editIcon);
          userPostText.append(deleteIcon);
          userPostText.appendChild(likePost);
        } else {
          divPostEntry.appendChild(userName);
          userName.appendChild(imgUser);
          divPostEntry.appendChild(userPostText);
          userName.appendChild(dateTimePost);
          userPostText.appendChild(likePost);
        }

        divTimeLine.appendChild(divPostEntry);
        btnPost.innerText = 'PUBLICAR';
        closeModal();
      });

    });
  };

  //onclikc likedPost
  const likedPost = async (event) => {
    const doc = await getTask(event.target.dataset.id); // traigo el documento, su id
    const docData = doc.data();

    if (docData.likes.some(like => like === currentUserInfo().uid)) {
      dislike(doc.id).then(response => { 
        console.log(response); // al haber sido clickeado entonces voy a correr la funcion dislike
        event.target.src = '/images/1erlike.png';
      });
    }
    else {
      giveLike(event.target.dataset.id)
          .then((response) => {
            // console.log(response);
            event.target.src = '/images/2dolike.png';
          })
          .catch();
    }
  };


 


  // onclick editarPost
  const editPost = async (event) => {
    const docToEdit = await getTask(event.target.dataset.id);
    const docData = docToEdit.data();
    showModal();
    console.log(docData);
    inputPostText.value = docData.postText;
    btnPost.disabled = false;
    btnPost.doc = docToEdit;
  };

  btnPost.addEventListener('click', (event) => {
    const doc = event.currentTarget.doc;

    if (doc) {
      const docData = doc.data();
      // console.log('data-id from edit button is: ', docData);
      docData.postText = inputPostText.value;
      console.log('updated doc to send to index', docData);
      updateTask(doc.id, docData).then((response) => {
        btnPost.doc = null;
        closeModal();
        refreshPosts();
      });
    }
    else {
      submitPost(inputPostText.value).then((response) => {
        console.log(response);
        closeModal();
        refreshPosts();
        alert('Reseña creada', response);
      });
    };
  });

  //onclick detelePost
  const deletePostListener = (event) => {//event por default
    const postId = event.target.dataset.id;//sacamos del target el id
    let opcion = confirm('Desea eliminar el comentario?');
    if (opcion === false) { }
    else {
      deletePost(postId);
    };
    refreshPosts();
  };

  //aqui se manda llamar el getDocs al cargar la pagina en Dashboard
  refreshPosts();


  btnLogout.addEventListener('click', () => {
    logOut(onNavigate);
  });

  
  btnCreatePost.addEventListener('click', () => {
    showModal();
    inputPostText.focus();
  });

  // Listener cerrar modal
  btnExit.addEventListener('click', () => closeModal());


  //Funcion activacion boton publicar
  inputPostText.addEventListener('keyup', () => {
    const valueInput = inputPostText.value.trim();
    // trim() metodo que no permite activar boton con espacio
    if (valueInput === '') {
      btnPost.disabled = true; // boton publicar inactivo
    } else {
      btnPost.disabled = false; // boton publicar activo
    }
  });

  // apertura visual del modal
  const showModal = () => {
    divModalBackground.style.display = 'flex';
    divModalContent.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };
  // ocultar visual el  modal
  const closeModal = () => {
    divModalBackground.style.display = 'none';
    divModalContent.style.display = 'none';
    document.body.style.overflow = 'visible';
    inputPostText.value = '';

  };

  divLogin.append(
    btnLogout,
  );

  return divLogin;

};