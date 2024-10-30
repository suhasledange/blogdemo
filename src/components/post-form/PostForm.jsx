import React, { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import service from '../../appwrite/config'
import Input from '../Input'
import RTE from '../RTE'
import Select from '../Select'
import Button from '../Button'
import imageCompression from 'browser-image-compression';
const PostForm = ({post}) => {

    const {register,handleSubmit,watch,setValue,control,getValues}= useForm({
        defaultValues:{
            title:post?.title || '',
            slug:post?.$id || '',
            content:post?.content || '',
            status:post?.status || '',
        }
    })

    const navigate = useNavigate()
    const userData = useSelector(state => state.auth.userData)

    const submit = async (data) => {
        let fileId;
    
        if (data.image && data.image[0]) {
            const originalFile = data.image[0];
    
            // Compression options
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };
    
            try {
                // Compress the file
                const compressedBlob = await imageCompression(originalFile, options);
    
                // Convert Blob to File
                const compressedFile = new File(
                    [compressedBlob],
                    originalFile.name,
                    { type: originalFile.type, lastModified: Date.now() }
                );
    
                const uploadedFile = await service.uploadFile(compressedFile);
                fileId = uploadedFile.$id;
    
            } catch (error) {
                console.error("Image compression error:", error);
                return;
            }
        }
    
        if (post) {
            if (fileId && post.featuredImage) {
                await service.deleteFile(post.featuredImage);
            }
    
            const updatedPost = await service.updatePost(post.$id, {
                ...data,
                featuredImage: fileId || post.featuredImage,
            });
    
            if (updatedPost) {
                navigate(`/post/${updatedPost.$id}`);
            }
        } else {
            const newPost = await service.createPost({
                ...data,
                featuredImage: fileId,
                userId: userData?.$id,
            });
    
            if (newPost) {
                navigate(`/post/${newPost.$id}`);
            }
        }
    };

    const slugTransform = useCallback((value)=>{
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    },[])

    useEffect(()=>{

        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();

    },[watch,slugTransform,setValue])

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={service.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
  )
}

export default PostForm
