import os

def clean_up_image_folder():
    """
    Clean up the image folders except .gitkeep file
    """
    for folder in ['uploads', 'compressed', 'watermarked', 'modified']:
        for filename in os.listdir(folder):
            if filename != '.gitkeep':
                os.remove(os.path.join(folder, filename))

    with open('image_timestamps.json', 'w') as f:
        f.write('{}')

# Clean up the image folders
if __name__ == '__main__':
    clean_up_image_folder()