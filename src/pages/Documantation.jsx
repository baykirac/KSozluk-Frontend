import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw'; 
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import adminRehber from '../docs/adminRehber.md?raw';
import Header from "../companents/Header";


export default function Documentation() {
  return (
    <>
      <Header isPosisitonFixed={true}/>
      <div  className = "p-8" style = {{ backgroundColor: "#f8f9fa" }}>
      <ReactMarkdown
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {adminRehber}
        </ReactMarkdown>
      </div>
    </>
  );
}
