import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw'; 
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehber from '../docs/rehber.md?raw';



export default function UserDoc() {
  return (
    <>
      <div  className = "p-8 pt-4" style = {{ backgroundColor: "#f8f9fa" }}>
      <ReactMarkdown
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {rehber}
        </ReactMarkdown>
      </div>
    </>
  );
}