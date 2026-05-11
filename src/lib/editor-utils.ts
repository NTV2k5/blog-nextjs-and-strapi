import Cookies from 'js-cookie';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function uploadImage(file: File) {
  const jwt = Cookies.get('jwt');
  if (!jwt) throw new Error('Authentication required');

  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data[0]; // Returns the uploaded file object
}
